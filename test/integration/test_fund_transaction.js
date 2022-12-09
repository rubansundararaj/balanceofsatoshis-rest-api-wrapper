const {address} = require('bitcoinjs-lib');
const {crypto} = require('bitcoinjs-lib');
const {networks} = require('bitcoinjs-lib');
const {script} = require('bitcoinjs-lib');
const {spawnLightningCluster} = require('ln-docker-daemons');
const {test} = require('@alexbosworth/tap');
const tinysecp = require('tiny-secp256k1');

const {fundTransaction} = require('./../../chain');

const {compile} = script;
const count = 100;
const {fromOutputScript} = address;
const makeTaprootKey = (k, h) => tinysecp.xOnlyPointAddTweak(k, h).xOnlyPubkey;
const OP_1 = 81;
const shortKey = keyPair =>  keyPair.publicKey.slice(1, 33);
const tapHash = k => crypto.taggedHash('TapTweak', k.publicKey.slice(1, 33));
const tokens = 1e6;

// Funding a transaction should result in a funded tx
test(`Fund transaction`, async ({end, equal, strictSame}) => {
  const ecp = (await import('ecpair')).ECPairFactory(tinysecp);
  const {kill, nodes} = await spawnLightningCluster({});

  const [{generate, lnd}] = nodes;

  await generate({count});

  const keyPair = ecp.makeRandom({network: networks.regtest});

  const outputKey = makeTaprootKey(shortKey(keyPair), tapHash(keyPair));
  const tweakHash = tapHash(keyPair);

  const outputScript = compile([OP_1, Buffer.from(outputKey)]);

  // Suppress fromOutputScript warning on Taproot address
  const warn = console.warn;
  console.warn = () => {};

  const address = fromOutputScript(outputScript, networks.regtest);

  // Restore warnings
  console.warn = warn;

  try {
    await fundTransaction({
      lnd,
      addresses: [address],
      amounts: [tokens.toString()],
      ask: () => {},
      spend: [],
      is_dry_run: false,
      logger: {error: () => {}, info: () => {}},
      utxos: [],
    });
  } catch (err) {
    equal(err, null, 'Expected no error');
  }

  await kill({});
});
