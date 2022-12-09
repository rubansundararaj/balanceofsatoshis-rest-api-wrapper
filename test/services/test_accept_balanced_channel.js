const EventEmitter = require('events');

const {address} = require('bitcoinjs-lib');
const {networks} = require('bitcoinjs-lib');
const {test} = require('@alexbosworth/tap');
const {Transaction} = require('bitcoinjs-lib');

const accept = require('./../../services/accept_balanced_channel');
const {getInfoResponse} = require('./../fixtures');
const {listPeersResponse} = require('./../fixtures');

const getInfoRes = () => JSON.parse(JSON.stringify(getInfoResponse));
const request = 'lnbc1pvjluezpp5qqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqqqsyqcyq5rqwzqfqypqdpl2pkx2ctnv5sxxmmwwd5kgetjypeh2ursdae8g6twvus8g6rfwvs8qun0dfjkxaq8rkx3yf5tcsyz3d73gafnh3cax9rn449d9p5uxz9ezhhypd0elx87sjle52x86fux2ypatgddc6k63n7erqz25le42c4u4ecky03ylcqca784w';
const {toOutputScript} = address;
const transitAddress = 'bc1q6x8d58yysr8xpv0m4qm4vk8h72rzmx4vsznplm';

const makeArgs = overrides => {
  const args = {
    accept_request: request,
    ask: ({}, cbk) => {
      const tx = new Transaction();

      const script = toOutputScript(transitAddress, networks.mainnet);

      tx.addInput(Buffer.alloc(32), 0);

      tx.addOutput(
        Buffer.from('001451814f108670aced2d77c1805ddd6634bc9d4731', 'hex'),
        10095
      );

      return cbk({fund: tx.toHex()});
    },
    capacity: 20000,
    fee_rate: 1,
    lnd: {
      default: {
        fundingStateStep: ({}, cbk) => cbk(),
        listPeers: ({}, cbk) => cbk(null, listPeersResponse),
        getInfo: ({}, cbk) => cbk(null, getInfoResponse),
        newAddress: (args, cbk) => {
          return cbk(null, {
            address: transitAddress,
          });
        },
        pendingChannels: ({}, cbk) => cbk(null, {
          pending_closing_channels: [],
          pending_force_closing_channels: [],
          pending_open_channels: [{
            channel: {
              capacity: '20000',
              channel_point: 'ff095fe27463f36ac1985df287f87da93073f9b903b77aec81b7ff314f8f193d:0',
              local_balance: 10000,
              local_chan_reserve_sat: '1',
              remote_balance: '1',
              remote_chan_reserve_sat: '1',
              remote_node_pub: '010000000000000000000000000000000000000000000000000000000000000000',
            },
            commit_fee: '1',
            commit_weight: '1',
            confirmation_height: 1,
            fee_per_kw: '1',
          }],
          total_limbo_balance: '1',
          waiting_close_channels: [],
        }),
        sendCustomMessage: (args, cbk) => cbk({details: 'unknown'}),
        SubscribeCustomMessages: ({}) => {
          const emitter = new EventEmitter();

          emitter.cancel = () => {};

          process.nextTick(() => emitter.emit('error', 'unsupported'));

          return emitter;
        },
      },
      router: {
        sendPaymentV2: ({}) => {
          const eventEmitter = new EventEmitter();

          process.nextTick(() => {
            return eventEmitter.emit('data', {
              creation_date: '1',
              creation_time_ns: '1',
              failure_reason: '',
              fee_msat: '1000',
              fee_sat: '1',
              htlcs: [{
                attempt_time_ns: '1',
                resolve_time_ns: '1',
                route: {
                  hops: [],
                  total_amt: '1',
                  total_amt_msat: '1000',
                  total_fees: '1',
                  total_fees_msat: '1000',
                  total_time_lock: 1,
                },
                status: 'SUCCEEDED',
              }],
              path: [],
              payment_hash: Buffer.alloc(32).toString('hex'),
              payment_index: '1',
              payment_preimage: Buffer.alloc(32).toString('hex'),
              payment_request: request,
              status: 'SUCCEEDED',
              value: '1',
              value_msat: '1000',
              value_sat: '1',
            });
          });

          return eventEmitter;
        },
      },
      signer: {
        signOutputRaw: ({}, cbk) => cbk(null, {raw_sigs: [Buffer.alloc(1)]}),
      },
      version: {
        getVersion: ({}, cbk) => cbk(null, {
          app_minor: 1,
          app_patch: 1,
          build_tags: ['autopilotrpc'],
          commit_hash: Buffer.alloc(20).toString('hex'),
        }),
      },
      wallet: {
        deriveKey: ({}, cbk) => cbk(null, {
          key_loc: {key_index: 0},
          raw_key_bytes: Buffer.alloc(33, 2),
        }),
        deriveNextKey: ({}, cbk) => cbk(null, {
          key_loc: {key_index: 0},
          raw_key_bytes: Buffer.alloc(33, 2),
        }),
      },
    },
    logger: {info: () => {}},
    multisig_key_index: 0,
    network: 'btc',
    partner_public_key: '010000000000000000000000000000000000000000000000000000000000000000',
    refund_address: transitAddress,
    remote_multisig_key: Buffer.alloc(33, 2).toString('hex'),
    remote_tx_id: Buffer.alloc(32).toString('hex'),
    remote_tx_vout: 0,
    transit_address: transitAddress,
    transit_key_index: 0,
    transit_public_key: Buffer.alloc(33, 2).toString('hex'),
  };

  Object.keys(overrides).forEach(k => args[k] = overrides[k]);

  return args;
};

const tests = [
  {
    args: makeArgs({}),
    description: 'Accept a balanced channel',
  },
  {
    args: makeArgs({ask: undefined}),
    description: 'An interrogation function is expected',
    error: [400, 'ExpectedAskFunctionToAcceptBalancedChannel'],
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, rejects, strictSame}) => {
    if (!!error) {
      await rejects(accept(args, args.test), error, 'Got error');
    } else {
      const accepted = await accept(args);

      equal(accepted.transaction_id.length, 64, 'Got funding tx id');
      equal(accepted.transaction_vout, 0, 'Got funding tx vout');
      equal(accepted.transactions.length, 1, 'Got funding txs');
    }

    return end();
  });
});
