const {addPeer} = require('ln-service');
const asyncAuto = require('async/auto');
const asyncEach = require('async/each');
const asyncRetry = require('async/retry');
const {createChainAddress} = require('ln-service');
const {fundPsbt} = require('ln-service');
const {getChannels} = require('ln-service');
const {getPendingChannels} = require('ln-service');
const {getWalletInfo} = require('ln-service');
const {openChannel} = require('ln-service');
const {signPsbt} = require('ln-service');
const {spawnLightningCluster} = require('ln-docker-daemons');
const {test} = require('@alexbosworth/tap');
const {Transaction} = require('bitcoinjs-lib');

const {openChannels} = require('./../../peers');

const count = 100;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const interval = 200;
const log = () => {};
const size = 2;
const times = 1000;

// Opening channels should open channels with specified nodes
test(`Open channels`, async ({end, equal, strictSame}) => {
  const {kill, nodes} = await spawnLightningCluster({size});

  const [{generate, lnd}, target] = nodes;

  try {
    await generate({count});

    await asyncRetry({interval, times}, async () => {
      await addPeer({lnd, public_key: target.id, socket: target.socket});

      await asyncEach(nodes, async ({lnd}) => {
        const chain = await getWalletInfo({lnd});

        if (!chain.is_synced_to_chain || !chain.is_synced_to_graph) {
          throw new Error('WaitingForSync');
        }
      });
    });

    const {address} = await asyncRetry({interval, times}, async () => {
      return await createChainAddress({lnd});
    });

    await delay(4000);

    // Open a single channel from a single node
    await asyncAuto({
      // Open channel
      propose: async () => {
        return asyncRetry({interval, times}, async () => {
          await openChannels({
            lnd,
            ask: async (args, cbk) => {
              if (args.name === 'internal') {
                return cbk({internal: false});
              }

              if (args.name === 'fund') {
                const address = args.message.split(' ')[9];

                const {psbt} = await fundPsbt({
                  lnd,
                  outputs: [{address, tokens: 6e6}],
                });

                const signed = await signPsbt({lnd, psbt});

                return cbk({fund: signed.psbt});
              }

              throw new Error('UnrecognizedParameter');
            },
            capacities: ['6*m'],
            cooperative_close_addresses: [address],
            fs: {getFile: () => {}},
            gives: [1e5],
            logger: {info: log, error: log},
            opening_nodes: [],
            public_keys: [target.id],
            request: () => {},
            set_fee_rates: [],
            types: [],
          });
        });
      },

      // Generate blocks until the channel confirms
      generate: async () => {
        return await asyncRetry({interval, times}, async () => {
          await generate({});

          const {channels} = await getChannels({lnd});

          if (!channels.length) {
            throw new Error('Expected Channels');
          }

          const [channel] = channels;

          equal(channel.remote_balance, 1e5, 'Gift balance is reflected');
          equal(channel.capacity, 6e6, 'Channel capacity is set');
          equal(channel.cooperative_close_address, address, 'Coop address');
        });
      },
    });
  } catch (err) {
    equal(err, null, 'Expected no error');
  }

  await kill({});
});
