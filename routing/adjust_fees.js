const asyncAuto = require('async/auto');
const asyncEach = require('async/each');
const asyncMap = require('async/map');
const asyncRetry = require('async/retry');
const {findKey} = require('ln-sync');
const {getChannel} = require('ln-service');
const {getChannels} = require('ln-service');
const {getFeeRates} = require('ln-service');
const {getIdentity} = require('ln-service');
const {getNode} = require('ln-service');
const {getNodeAlias} = require('ln-sync');
const {getPendingChannels} = require('ln-service');
const {gray} = require('colorette');
const {green} = require('colorette');
const moment = require('moment');
const {returnResult} = require('asyncjs-util');
const {updateChannelFee} = require('ln-sync');

const {chartAliasForPeer} = require('./../display');
const {formatFeeRate} = require('./../display');
const {getIcons} = require('./../display');
const parseFeeRateFormula = require('./parse_fee_rate_formula');

const asTxOut = n => `${n.transaction_id}:${n.transaction_vout}`;
const {ceil} = Math;
const flatten = arr => [].concat(...arr);
const interval = 1000 * 60 * 2;
const {isArray} = Array;
const {max} = Math;
const minCltvDelta = 18;
const nodeMatch = /\bFEE_RATE_OF_[0-9A-F]{66}\b/gim;
const noFee = gray('Unknown Rate');
const pubKeyForNodeMatch = n => n.substring(12).toLowerCase();
const shortKey = key => key.substring(0, 20);
const sumOf = arr => arr.reduce((sum, n) => sum + n, 0);
const times = 360;
const uniq = arr => Array.from(new Set(arr));

/** View and adjust routing fees

  {
    [cltv_delta]: <Set CLTV Delta Number>
    [fee_rate]: <Fee Rate String>
    fs: {
      getFile: <Read File Contents Function> (path, cbk) => {}
    }
    lnd: <Authenticated LND API Object>
    logger: <Winstone Logger Object>
    to: [<Adjust Routing Fee To Peer Alias or Public Key or Tag String>]
  }

  @returns via cbk or Promise
  {
    rows: [[<Table Cell String>]]
  }
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!args.fs) {
          return cbk([400, 'ExpectedFsMethodsToAdjustFeeRates']);
        }

        if (!args.lnd) {
          return cbk([400, 'ExpectedLndToAdjustFeeRates']);
        }

        if (!args.logger) {
          return cbk([400, 'ExpectedLoggerToAdjustFeeRates']);
        }

        if (!isArray(args.to)) {
          return cbk([400, 'ExpectedArrayOfPeersToAdjustFeesTowards']);
        }

        if (args.cltv_delta !== undefined && !args.to.length) {
          return cbk([400, 'SettingGlobalCltvDeltaNotSupported']);
        }

        if (args.cltv_delta !== undefined && args.cltv_delta < minCltvDelta) {
          return cbk([400, 'SettingLowCltvDeltaIsNotSupported']);
        }

        if (args.fee_rate !== undefined && !args.to.length) {
          return cbk([400, 'SettingGlobalFeeRateNotSupported']);
        }

        return cbk();
      },

      // Get the channels
      getChannels: ['validate', ({}, cbk) => {
        return getChannels({lnd: args.lnd}, cbk);
      }],

      // Get node icons
      getIcons: ['validate', ({}, cbk) => getIcons({fs: args.fs}, cbk)],

      // Get the pending channels
      getPending: ['validate', ({}, cbk) => {
        return getPendingChannels({lnd: args.lnd}, cbk);
      }],

      // Get the wallet public key
      getPublicKey: ['validate', ({}, cbk) => {
        return getIdentity({lnd: args.lnd}, cbk);
      }],

      // Get the current fee rates
      getFeeRates: ['validate', ({}, cbk) => {
        return getFeeRates({lnd: args.lnd}, cbk);
      }],

      // Get the aliases of the channel partners
      getAliases: ['getChannels', ({getChannels}, cbk) => {
        const ids = uniq(getChannels.channels.map(n => n.partner_public_key));

        return asyncMap(ids, (id, cbk) => {
          return getNodeAlias({id, lnd: args.lnd}, cbk);
        },
        cbk);
      }],

      // Get the peers to assign fee rates towards
      getPeers: ['getChannels', 'getIcons', ({getChannels, getIcons}, cbk) => {
        const {channels} = getChannels;

        return asyncMap(args.to, (query, cbk) => {
          const nodes = getIcons.nodes.filter(n => n.aliases.includes(query));

          // Exit early when there is a tag match
          if (!!nodes.length) {
            return cbk(null, nodes.map(n => ({public_key: n.public_key})));
          }

          return findKey({channels, query, lnd: args.lnd}, cbk);
        },
        (err, res) => {
          if (!!err) {
            return cbk(err);
          }

          return cbk(null, flatten(res));
        });
      }],

      // Get referenced other node rates
      getNodeRates: ['getPeers', ({getPeers}, cbk) => {
        // Exit early when not referencing another node's fee rate
        if (!args.fee_rate || !args.fee_rate.match(nodeMatch)) {
          return cbk(null, []);
        }

        const [peer, otherPeer] = getPeers;

        // Exit with error when multiple to peers are specified
        if (!!otherPeer) {
          return cbk([400, 'MultipleToNotSupportedWhenReferencingNodeRate']);
        }

        const nodeIds = args.fee_rate.match(nodeMatch).map(pubKeyForNodeMatch);

        return getNode({
          lnd: args.lnd,
          public_key: peer.public_key,
        },
        (err, res) => {
          if (!!err) {
            return cbk(err);
          }

          // Map referenced node ids to their fee rates
          const feeRates = nodeIds.map(key => {
            // Relevant forwarding policies
            const policies = res.channels
              .filter(n => !!n.policies.find(n => n.public_key === key))
              .map(({policies}) => policies.find(n => n.public_key === key))
              .filter(n => !!n.updated_at);

            // Exit early when there is no defined policy for an edge
            if (!policies.length) {
              return;
            }

            return {
              key: `FEE_RATE_OF_${key.toUpperCase()}`,
              rate: max(...policies.map(n => n.fee_rate)),
            };
          });

          const rates = feeRates.filter(n => !!n);

          if (!rates.length) {
            return cbk([400, 'NoNodeRatesFoundToUpdateFeeRatesFromNode']);
          }

          return cbk(null, rates);
        });
      }],

      // Get the policies of all channels
      getPolicies: ['getChannels', ({getChannels}, cbk) => {
        return asyncMap(getChannels.channels, (channel, cbk) => {
          return getChannel({id: channel.id, lnd: args.lnd}, (err, res) => {
            if (isArray(err) && err.slice().shift() === 404) {
              return cbk();
            }

            if (!!err) {
              return cbk(err);
            }

            // Exit early when the channel policies are not defined
            if (!!res.policies.find(n => n.cltv_delta === undefined)) {
              return cbk();
            }

            return cbk(null, res);
          });
        },
        cbk);
      }],

      // Figure out updated fee rates of the specified channels for adjustments
      feeUpdates: [
        'getChannels',
        'getFeeRates',
        'getNodeRates',
        'getPeers',
        'getPending',
        'getPolicies',
        'getPublicKey',
        ({
          getChannels,
          getFeeRates,
          getNodeRates,
          getPeers,
          getPending,
          getPolicies,
          getPublicKey,
        },
        cbk) =>
      {
        // Exit early when not updating policy
        if (args.cltv_delta === undefined && args.fee_rate === undefined) {
          return cbk();
        }

        const ownKey = getPublicKey.public_key;
        const peerKeys = getPeers.map(n => n.public_key).filter(n => !!n);

        return asyncMap(peerKeys, (key, cbk) => {
          const channels = []
            .concat(getChannels.channels)
            .concat(getPending.pending_channels.filter(n => !!n.is_opening))
            .filter(channel => channel.partner_public_key === key);

          const peerPolicies = getPolicies
            .filter(n => !!n)
            .filter(n => channels.find(chan => asTxOut(chan) === asTxOut(n)))
            .map(n => n.policies.find(p => p.public_key !== ownKey))
            .filter(n => !!n);

          const inboundFeeRate = max(...peerPolicies.map(n => n.fee_rate));

          const feeRates = getFeeRates.channels.filter(rate => {
            return channels.find(n => asTxOut(n) === asTxOut(rate));
          });

          const currentPolicies = getPolicies
            .filter(n => !!n)
            .filter(n => channels.find(chan => asTxOut(chan) === asTxOut(n)))
            .map(n => n.policies.find(p => p.public_key === ownKey))
            .filter(n => !!n);

          const baseFeeMillitokens = feeRates
            .map(n => BigInt(n.base_fee_mtokens))
            .reduce((sum, fee) => fee > sum ? fee : sum, BigInt(Number()));

          const {failure, rate} = parseFeeRateFormula({
            fee_rate: args.fee_rate,
            inbound_fee_rate: inboundFeeRate,
            inbound_liquidity: sumOf(channels.map(n => n.remote_balance)),
            outbound_liquidity: sumOf(channels.map(n => n.local_balance)),
            node_rates: getNodeRates,
          });

          if (!!failure) {
            return cbk([400, failure]);
          }

          return cbk(null, channels.map(channel => {
            // Exit early when there is no known policy
            if (!currentPolicies.length) {
              return {
                cltv_delta: args.cltv_delta,
                fee_rate: rate,
                transaction_id: channel.transaction_id,
                transaction_vout: channel.transaction_vout,
              };
            }

            // Only the highest CLTV delta across all peer channels applies
            const cltvDelta = max(...currentPolicies.map(n => n.cltv_delta));

            // Only the highest fee rate across all peer channels applies
            const maxFeeRate = max(...currentPolicies.map(n => n.fee_rate));

            return {
              base_fee_mtokens: baseFeeMillitokens.toString(),
              cltv_delta: args.cltv_delta || cltvDelta,
              fee_rate: rate !== undefined ? rate : maxFeeRate,
              transaction_id: channel.transaction_id,
              transaction_vout: channel.transaction_vout,
            };
          }));
        },
        cbk);
      }],

      // Execute fee updates
      updateFees: [
        'feeUpdates',
        'getPublicKey',
        ({feeUpdates, getPublicKey}, cbk) =>
      {
        if (!feeUpdates) {
          return cbk();
        }

        return asyncEach(flatten(feeUpdates), (update, cbk) => {
          return asyncRetry({interval, times}, cbk => {
            return updateChannelFee({
              base_fee_mtokens: update.base_fee_mtokens,
              cltv_delta: update.cltv_delta,
              fee_rate: ceil(update.fee_rate),
              from: getPublicKey.public_key,
              lnd: args.lnd,
              transaction_id: update.transaction_id,
              transaction_vout: update.transaction_vout,
            },
            err => {
              if (!!err) {
                args.logger.error(err);

                args.logger.info({
                  next_retry: moment().add(interval, 'ms').calendar(),
                });

                return cbk(err);
              }

              return cbk();
            });
          },
          cbk);
        },
        cbk);
      }],

      // Get final fee rates
      getRates: ['updateFees', ({}, cbk) => {
        return getFeeRates({lnd: args.lnd}, cbk);
      }],

      // Get fee rundown
      fees: [
        'getAliases',
        'getChannels',
        'getIcons',
        'getPeers',
        'getPolicies',
        'getRates',
        ({
          getAliases,
          getChannels,
          getIcons,
          getPeers,
          getPolicies,
          getRates,
        },
        cbk) =>
      {
        const peersWithFees = getAliases.map(({alias, id}) => {
          const channels = getChannels.channels.filter(channel => {
            return channel.partner_public_key === id;
          });

          const peerRates = getRates.channels.filter(channel => {
            return !!channels.find(rate => {
              if (channel.transaction_id !== rate.transaction_id) {
                return false;
              }

              return channel.transaction_vout === rate.transaction_vout;
            });
          });

          const rate = max(...peerRates.map(n => n.fee_rate));

          const nodeIcons = getIcons.nodes.find(n => n.public_key === id);

          const {display} = chartAliasForPeer({
            alias,
            icons: !!nodeIcons ? nodeIcons.icons : undefined,
            is_inactive: channels.find(n => !n.is_active),
            public_key: id,
          });

          return {
            alias: display,
            id: id,
            out_fee: !peerRates.length ? noFee : formatFeeRate({rate}).display,
          };
        });

        const rows = []
          .concat([['Peer', 'Out Fee', 'Public Key']])
          .concat(peersWithFees
            .filter(peer => {
              if (!args.to.length) {
                return true;
              }

              return getPeers.find(n => n.public_key === peer.id);
            })
            .map(peer => {
              const isChange = getPeers.find(n => n.public_key === peer.id);

              return [
                isChange ? green(peer.alias) : peer.alias,
                isChange ? green(peer.out_fee) : peer.out_fee,
                isChange ? green(peer.id) : peer.id,
              ];
            })
          );

        return cbk(null, {rows});
      }],
    },
    returnResult({reject, resolve, of: 'fees'}, cbk));
  });
};
