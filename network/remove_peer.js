const asyncAuto = require('async/auto');
const asyncMapSeries = require('async/mapSeries');
const {closeChannel} = require('ln-service');
const {decodeChanId} = require('bolt07');
const {getChainFeeRate} = require('ln-service');
const {getChainTransactions} = require('ln-service');
const {getChannels} = require('ln-service');
const {getHeight} = require('ln-service');
const {getNetwork} = require('ln-sync');
const {getPendingChannels} = require('ln-service');
const {returnResult} = require('asyncjs-util');
const {Transaction} = require('bitcoinjs-lib');

const {getMempoolSize} = require('./../chain');
const getPeers = require('./get_peers');

const arrayWithEntries = arr => !!arr.length ? arr : undefined;
const asOutpoint = n => `${n.transaction_id}:${n.transaction_vout}`;
const asRate = n => n.toFixed(2);
const defaultDays = 365 * 2;
const estimateDisk = n => Math.round(n * 500 / 1e6 * 10) / 10;
const fastConf = 6;
const {floor} = Math;
const {fromHex} = Transaction;
const getMempoolRetries = 10;
const iconDisabled = channel => !channel.is_active ? '💀 ' : '';
const iconPending = channel => channel.pending_payments.length ? '💸 ' : ''
const {isArray} = Array;
const isPublicKey = n => !!n && /^0[2-3][0-9A-F]{64}$/i.test(n);
const maxFeeRate = (chan, rate) => !!chan.is_active ? rate * 100 : undefined;
const maxInputs = 1;
const maxMempoolSize = 2e6;
const regularConf = 72;
const slowConf = 144;
const sumOf = arr => arr.reduce((sum, n) => sum + n, Number());
const tokensAsBigUnit = tokens => (tokens / 1e8).toFixed(8);

/** Close out channels with a peer and disconnect them

  {
    addresses: [<Close Out Funds to On-Chain Address String>]
    ask: <Ask Function>
    [chain_fee_rate]: <Chain Fee Per VByte Number>
    fs: {
      getFile: <Read File Contents Function> (path, cbk) => {}
    }
    [idle_days]: <No Activity From Peer For Days Number>
    [is_active]: <Peer Is Actively Connected Bool>
    [is_dry_run]: <Avoid Actually Closing Channel Bool>
    [is_forced]: <Force Close When Cooperative Close Is Impossible Bool>
    [is_offline]: <Peer Is Disconnected Bool>
    [is_private]: <Peer is Privately Connected Bool>
    [is_public]: <Peer is Publicly Connected Bool>
    [is_selecting_channels]: <Interactively Select Channels to Remove Bool>
    lnd: <Authenticated LND API Object>
    logger: <Winston Logger Object>
    [omit]: [<Avoid Peer With Public Key String>]
    outpoints: [<Only Remove Specific Channel Funding Outpoint String>]
    [public_key]: <Public Key Hex String>
    request: <Request Function>
  }

  @returns via cbk or Promise
*/
module.exports = (args, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!isArray(args.addresses)) {
          return cbk([400, 'ExpectedArrayOfAddressesToRemovePeer']);
        }

        if (!args.ask) {
          return cbk([400, 'ExpectedAskFunctionToRemovePeer']);
        }

        if (!args.fs) {
          return cbk([400, 'ExpectedFsMethodsToRemovePeer']);
        }

        if (!!args.is_selecting_channels && !args.public_key) {
          return cbk([400, 'ExpectedPeerToRemoveWhenSelectingChannels']);
        }

        if (!args.lnd) {
          return cbk([400, 'LndIsRequiredToRemovePeer']);
        }

        if (!args.logger) {
          return cbk([400, 'LoggerIsRequiredToRemovePeer']);
        }

        if (!isArray(args.outpoints)) {
          return cbk([400, 'ExpectedSpecificOutpointsToRemoveFromPeer']);
        }

        if (!!args.outpoints.length && !args.public_key) {
          return cbk([400, 'ExpectedPeerToRemoteWhenOutpointsSpecified']);
        }

        if (!!args.public_key && !isPublicKey(args.public_key)) {
          return cbk([400, 'ExpectedPublicKeyOfPeerToRemove']);
        }

        if (!args.request) {
          return cbk([400, 'RequestIsRequiredToRemovePeer']);
        }

        return cbk();
      },

      // Get channels
      getChannels: ['validate', ({}, cbk) => {
        return getChannels({lnd: args.lnd}, cbk);
      }],

      // Get fast fee rate
      getFastFee: ['validate', ({}, cbk) => {
        return getChainFeeRate({
          confirmation_target: fastConf,
          lnd: args.lnd,
        },
        cbk);
      }],

      // Get the chain height to optimize chain txs lookups for chain fees
      getHeight: ['validate', ({}, cbk) => getHeight({lnd: args.lnd}, cbk)],

      // Get network
      getNetwork: ['validate', ({}, cbk) => {
        return getNetwork({lnd: args.lnd}, cbk);
      }],

      // Get normal fee rate
      getNormalFee: ['validate', ({}, cbk) => {
        return getChainFeeRate({
          confirmation_target: regularConf,
          lnd: args.lnd,
        },
        cbk);
      }],

      // Get peers
      getPeers: ['validate', ({}, cbk) => {
        return getPeers({
          earnings_days: args.idle_days || defaultDays,
          filters: args.filters,
          fs: args.fs,
          idle_days: args.idle_days || Number(),
          is_active: args.is_active,
          is_offline: args.is_offline,
          is_private: args.is_private,
          is_public: args.is_public,
          is_showing_last_received: true,
          lnd: args.lnd,
          omit: args.omit || [],
          sort_by: 'last_activity',
        },
        cbk);
      }],

      // Get low fee rate
      getSlowFee: ['validate', ({}, cbk) => {
        return getChainFeeRate({
          confirmation_target: slowConf,
          lnd: args.lnd,
        },
        cbk);
      }],

      // Determine outpoints to use
      outpoints: ['getChannels', ({getChannels}, cbk) => {
        // Exit early when a peer is not specified
        if (!args.public_key) {
          return cbk(null, []);
        }

        const channelsWithPeer = getChannels.channels
          .filter(channel => {
            // Ignore channels that are not the specified public key
            if (channel.partner_public_key !== args.public_key) {
              return false;
            }

            //Return channels with the peer
            return true;
          })
          .sort((a, b) => {
            const heightA = decodeChanId({channel: a.id}).block_height;
            const heightB = decodeChanId({channel: b.id}).block_height;

            // Sort channels by oldest to newest
            return heightA - heightB;
          });

        // Exit early when no channels are available
        if (!channelsWithPeer.length) {
          return cbk([404, 'NoChannelsToCloseWithSpecifiedPeer']);
        }

        // Collect any outpoints that are unable to be cooperatively closed
        const blocked = channelsWithPeer
          .filter(channel => {
            // Channels that are inactive or have HTLCs cannot be coop-closed
            return !channel.is_active || !!channel.pending_payments.length;
          })
          .map(channel => asOutpoint(channel));

        // Find a directly referenced outpoint that is in the blocked list
        const blockedOutpoint = args.outpoints.find(n => blocked.includes(n));

        // Make sure we aren't trying to coop close a channel that can't be
        if (!args.is_forced && !!blockedOutpoint) {
          return cbk([400, 'CannotCoopClose', {outpoint: blockedOutpoint}]);
        }

        // Exit early if not selecting a channel
        if (!args.is_selecting_channels) {
          return cbk(null, args.outpoints);
        }

        // Interactively select outpoints to close
        return args.ask({
          choices: channelsWithPeer.map(channel => {
            // In closing, channels are identified by their funding outpoint
            const value = asOutpoint(channel);

            // Channels that are inactive or have HTLCs cannot be coop-closed
            const isBlocked = blocked.includes(value);

            const disk = `Est disk mb: ${estimateDisk(channel.past_states)}`;
            const icon = iconDisabled(channel) || iconPending(channel);
            const {id} = channel;
            const inbound = `in: ${tokensAsBigUnit(channel.remote_balance)}`;
            const outbound = `out: ${tokensAsBigUnit(channel.local_balance)}`;

            return {
              value,
              checked: args.outpoints.includes(value),
              disabled: !args.is_forced ? isBlocked : false,
              name: `${icon}${id}: ${inbound} | ${outbound}. ${disk}.`,
            };
          }),
          loop: false,
          message: `Channels to ${!!args.is_forced ? 'force ' : ''}close?`,
          name: 'outpoints',
          type: 'checkbox',
          validate: input => !!input.length,
        },
        ({outpoints}) => cbk(null, outpoints));
      }],

      // Check channels for peer to make sure that they can be cleanly closed
      checkChannels: [
        'getChannels',
        'outpoints',
        ({getChannels, outpoints}, cbk) =>
      {
        // Exit early when a peer is not specified or force closing is OK
        if (!args.public_key || !!args.is_forced) {
          return cbk();
        }

        const selectedChannels = getChannels.channels.filter(channel => {
          // Ignore channels that are not the specified public key
          if (channel.partner_public_key !== args.public_key) {
            return false;
          }

          // Exit early when there are no outpoints, consider all peer channels
          if (!outpoints.length) {
            return true;
          }

          // Only include selected channels
          return outpoints.includes(asOutpoint(channel));
        });

        const costToClose = selectedChannels
          .filter(n => n.is_partner_initiated === false)
          .map(n => n.commit_transaction_fee)
          .reduce((sum, n) => sum + n, Number());

        const [cannotCoopClose] = selectedChannels.filter(channel => {
          // Inactive channels cannot be cooperatively closed
          if (!channel.is_active) {
            return true;
          }

          // Channels with pending payments cannot be cooperatively closed
          if (!!channel.pending_payments.length) {
            return true;
          }

          // Channel with the peer can be cooperatively closed
          return false;
        });

        // Exit with error when there is a channel that cannot be coop closed
        if (!!cannotCoopClose) {
          return cbk([400, 'CannotCurrentlyCooperativelyCloseWithPeer', {
            is_active: cannotCoopClose.is_active,
            pending: arrayWithEntries(cannotCoopClose.pending_payments),
            cost_to_force_close: costToClose,
          }]);
        }

        return cbk();
      }],

      // Get mempool size
      getMempool: ['getNetwork', ({getNetwork}, cbk) => {
        return getMempoolSize({
          network: getNetwork.network,
          request: args.request,
          retries: getMempoolRetries,
        },
        cbk);
      }],

      // Check if the chain fee rate is high
      checkChainFees: [
        'getFastFee',
        'getMempool',
        'getNormalFee',
        'getSlowFee',
        ({getFastFee, getMempool, getNormalFee, getSlowFee}, cbk) =>
      {
        // Exit early when force closing or closing with a set fee rate
        if (!!args.is_forced || !!args.chain_fee_rate) {
          return cbk();
        }

        const fastFee = getFastFee.tokens_per_vbyte;
        const feeRate = getNormalFee.tokens_per_vbyte;
        const slowFee = getSlowFee.tokens_per_vbyte;

        const estimateRatio = fastFee / slowFee;
        const vbytesRatio = (getMempool.vbytes || Number()) / maxMempoolSize;

        if (!!floor(estimateRatio) && !!floor(vbytesRatio)) {
          return cbk([503, 'FeeRateIsHighNow', {needed_fee_rate: feeRate}]);
        }

        return cbk();
      }],

      // Select a peer
      selectPeer: [
        'checkChainFees',
        'getChannels',
        'getPeers',
        ({getChannels, getPeers}, cbk) =>
      {
        const [peer] = getPeers.peers
          .filter(peer => {
            // Exit early when any peer is eligible
            if (!args.public_key) {
              return true;
            }

            return peer.public_key === args.public_key;
          })
          .filter(peer => {
            // Exit early when force closes are allowed
            if (!args.is_forced) {
              return true;
            }

            const channels = getChannels.channels.filter(channel => {
              return channel.partner_public_key === peer.public_key;
            });

            // Exit early when a channel has a payment in flight
            if (!!channels.find(n => !!n.pending_payments.length)) {
              return false;
            }

            // Exit early when a channel is offline
            if (!!channels.find(n => !n.is_active)) {
              return false;
            }

            return true;
          });

        if (!peer && !!args.public_key) {
          return cbk(null, {public_key: args.public_key});
        }

        return cbk(null, peer);
      }],

      // Determine which channels need to be closed and close them
      channelsToClose: [
        'checkChannels',
        'getChannels',
        'getNormalFee',
        'outpoints',
        'selectPeer',
        ({getChannels, getNormalFee, outpoints, selectPeer}, cbk) =>
      {
        // Exit early when there is no peer to close out with
        if (!selectPeer) {
          return cbk([400, 'NoPeerFoundToRemove']);
        }

        const feeRate = args.chain_fee_rate || getNormalFee.tokens_per_vbyte;

        const toClose = getChannels.channels
          .filter(chan => chan.partner_public_key === selectPeer.public_key)
          .filter(chan => {
            // When no outpoints are specified, all channels should be closed
            if (!outpoints.length) {
              return true;
            }

            return !!outpoints.includes(asOutpoint(chan));
          })
          .map((channel, index) => ({channel, index}));

        // Exit early when there are no channels to close
        if (!toClose.length) {
          return cbk([400, 'NoChannelsToCloseWithPeer']);
        }

        args.logger.info({
          close_with_peer: selectPeer,
          channels_to_close: toClose.map(n => n.channel.id),
          fee_rate: !args.is_forced ? feeRate : undefined,
        });

        // Exit early when not closing any channels
        if (!!args.is_dry_run) {
          args.logger.info({is_dry_run: true});

          return cbk(null, []);
        }

        const [defaultAddress] = args.addresses;

        return asyncMapSeries(toClose, ({channel, index}, cbk) => {
          const address = args.addresses[index] || defaultAddress;
          const isLocked = !!channel.cooperative_close_address;

          return closeChannel({
            address: !isLocked && !!address ? address : undefined,
            is_force_close: !channel.is_active,
            lnd: args.lnd,
            max_tokens_per_vbyte: maxFeeRate(channel, feeRate),
            tokens_per_vbyte: !!channel.is_active ? feeRate : undefined,
            transaction_id: channel.transaction_id,
            transaction_vout: channel.transaction_vout,
          },
          (err, res) => {
            if (!!err) {
              return cbk([503, 'UnexpectedErrorClosingChannel', {err}]);
            }

            args.logger.info({
              close_transaction_id: res.transaction_id,
              close_transaction_vout: res.transaction_vout,
            });

            return cbk(null, {
              funding_outpoint: asOutpoint(channel),
              closing_outpoint: asOutpoint(res),
              closing_tx_id: res.transaction_id,
            });
          });
        },
        cbk);
      }],

      // Get pending chain transactions to relate funding outpoints
      getPending: ['channelsToClose', ({}, cbk) => {
        return getPendingChannels({lnd: args.lnd}, cbk);
      }],

      // Get unconfirmed chain transactions to derive final transaction fees
      getTransactions: ['channelsToClose', 'getHeight', ({getHeight}, cbk) => {
        return getChainTransactions({
          after: getHeight.current_block_height,
          lnd: args.lnd,
        },
        cbk);
      }],

      // Derive the chain transaction fees
      fees: [
        'channelsToClose',
        'getPending',
        'getTransactions',
        ({channelsToClose, getPending, getTransactions}, cbk) =>
      {
        // Map pending channels to chain transaction fees being paid
        const pending = getPending.pending_channels.map(channel => {
          const outpoint = channelsToClose.find(outpoints => {
            return outpoints.funding_outpoint === asOutpoint(channel);
          });

          // Exit early when this pending channel isn't part of the close set
          if (!outpoint) {
            return;
          }

          const matching = getTransactions.transactions.find(tx => {
            return tx.id === outpoint.closing_tx_id;
          });

          // Exit early when there is no matching tx for the close tx
          if (!matching || matching.inputs > maxInputs) {
            return;
          }

          // Exit early when there is no raw transaction
          if (!matching.transaction) {
            return;
          }

          const tx = fromHex(matching.transaction);

          const fee = channel.capacity - sumOf(tx.outs.map(n => n.value));

          return {
            close_transaction_id: matching.id,
            transaction_fee: tokensAsBigUnit(fee),
            transaction_fee_rate: asRate(fee / tx.virtualSize()),
          };
        });

        // Log out the pending channel fees
        pending.filter(n => !!n).forEach(n => args.logger.info(n));

        return cbk();
      }],
    },
    returnResult({reject, resolve}, cbk));
  });
};
