const asyncAuto = require('async/auto');
const asyncMapSeries = require('async/mapSeries');
const {resolutionType} = require('bolt03');
const {returnResult} = require('asyncjs-util');
const {Transaction} = require('bitcoinjs-lib');

const {endpoints} = require('./blockstream');

const closeSpendsDelayMs = 1000;
const flatten = arr => [].concat(...arr);
const getTxDelayMs = 2000;

/** Get channel resolution

  {
    close_transaction_id: <Close Transaction Id String>
    [is_cooperative_close]: <Channel Is Cooperatively Closed Bool>
    network: <Network Name String>
    request: <Request Function>
    transactions: [{
      id: <Transaction Id String>
      output_addresses: [<Address String>]
      transaction: <Raw Transaction Hex String>
    }]
  }

  @returns via cbk or Promise
  {
    [resolutions]: [{
      type: <Resolution Type String>
      value: <Value Number>
    }]
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!args.close_transaction_id) {
          return cbk([400, 'ExpectedCloseTransactionIdToGetChanResolution']);
        }

        if (!args.network) {
          return cbk([400, 'ExpectedNodeNetworkNameToGetChannelResolution']);
        }

        if (!args.request) {
          return cbk([400, 'ExpectedRequestFunctionToGetChannelResolution']);
        }

        return cbk();
      },

      // Get commitment transaction
      getCommitmentTransaction: ['validate', ({}, cbk) => {
        if (!!args.is_cooperative_close) {
          return cbk();
        }

        const id = args.close_transaction_id;

        const found = args.transactions.find(n => n.id === id);

        // Exit early when the transaction is pre-provided
        if (!!found) {
          return cbk(null, found.transaction);
        }

        return args.request({
          url: `${endpoints[args.network]}tx/${id}/hex`
        },
        (err, r, txHex) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorGettingCommitTxInfo', err]);
          }

          if (!r || r.statusCode !== 200) {
            return cbk([503, 'UnexpectedResponseCodeWhenGettingCommitTx']);
          }

          if (!txHex) {
            return cbk([503, 'ExpectedTransactionForCommitTxId']);
          }

          return cbk(null, txHex);
        });
      }],

      // Decode transactions to derive spends
      spends: ['validate', ({}, cbk) => {
        const spends = args.transactions.map(({id, transaction}) => {
          return Transaction.fromHex(transaction).ins.map(({hash}, index) => {
            return {
              id: hash.reverse().toString('hex'),
              spent_by: id,
              vin: index,
            };
          });
        });

        return cbk(null, flatten(spends));
      }],

      // Get close tx output spends
      getCloseSpends: ['spends', ({spends}, cbk) => {
        if (!!args.is_cooperative_close) {
          return cbk(null, []);
        }

        const closeTxId = args.close_transaction_id;

        const found = args.transactions.find(n => n.id === closeTxId);

        const outspends = spends.filter(n => n.id === closeTxId);

        // Exit early without requesting when all spends are found locally
        if (!!found && found.output_addresses.length === outspends.length) {
          return cbk(null, outspends.map(outspend => {
            return {txid: outspend.spent_by, vin: outspend.vin};
          }));
        }

        return args.request({
          json: true,
          url: `${endpoints[args.network]}tx/${closeTxId}/outspends`,
        },
        (err, r, outspends) => {
          if (!!err) {
            return cbk([503, 'UnexpectedErrorGettingOutspentsForTx', err]);
          }

          if (!r || r.statusCode !== 200) {
            return cbk([503, 'UnexpectedResponseCodeWhenGettingOutspends']);
          }

          if (!Array.isArray(outspends)) {
            return cbk([503, 'ExpectedJsonResultForTransactionOutspents']);
          }

          const unexpectedOutspend = outspends.find(n => {
            if (!n.spent) {
              return false;
            }

            return !n.txid || n.vin === undefined;
          });

          if (!!unexpectedOutspend) {
            return cbk([503, 'UnexpectedResultFromOutspendQuery', outspends]);
          }

          return setTimeout(() => {
            return cbk(null, outspends.map(outspend => ({
              txid: outspend.txid,
              vin: outspend.vin,
            })));
          },
          closeSpendsDelayMs);
        });
      }],

      // Get transactions
      getTransactions: ['getCloseSpends', ({getCloseSpends}, cbk) => {
        const txs = {};

        return asyncMapSeries(getCloseSpends, ({txid, vin}, cbk) => {
          if (!txid) {
            return cbk(null, {});
          }

          if (!!txs[txid]) {
            return cbk(null, {id: txid, transaction: txs[txid]});
          }

          const found = args.transactions.find(n => n.id === txid);

          // Exit early when the transaction is pre-provided
          if (!!found) {
            return cbk(null, {id: txid, transaction: found.transaction});
          }

          return args.request({
            url: `${endpoints[args.network]}tx/${txid}/hex`
          },
          (err, r, txHex) => {
            if (!!err) {
              return cbk([503, 'UnexpectedErrorGettingSpentTxInfo', err]);
            }

            if (!r || r.statusCode !== 200) {
              return cbk([503, 'UnexpectedResponseCodeWhenGettingTx']);
            }

            if (!txHex) {
              return cbk([503, 'ExpectedTransactionForSpendTxId']);
            }

            txs[txid] = txHex;

            return setTimeout(() => {
              return cbk(null, {id: txid, transaction: txHex});
            },
            getTxDelayMs);
          });
        },
        cbk);
      }],

      // Resolutions
      resolutions: [
        'getCloseSpends',
        'getCommitmentTransaction',
        'getTransactions',
        ({getCloseSpends, getCommitmentTransaction, getTransactions}, cbk) =>
      {
        // Exit early when the channel was closed cooperatively
        if (!!args.is_cooperative_close) {
          return cbk(null, {});
        }

        const tx = Transaction.fromHex(getCommitmentTransaction);

        const resolutions = getCloseSpends.map(({txid, vin}, i) => {
          const {transaction} = getTransactions.find(n => txid === n.id) || {};
          const {value} = tx.outs[i];

          if (!transaction) {
            return {value, type: 'unspent'};
          }

          return {
            value,
            transaction_id: Transaction.fromHex(transaction).getId(),
            type: resolutionType({vin, transaction}).type,
          };
        });

        if (!resolutions.length) {
          return cbk();
        }

        return cbk(null, {resolutions});
      }],
    },
    returnResult({reject, resolve, of: 'resolutions'}, cbk));
  });
};
