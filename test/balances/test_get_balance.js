const {test} = require('@alexbosworth/tap');

const {getBalance} = require('./../../balances');
const {listChannelsResponse} = require('./../fixtures');

const makeLnd = ({unconfirmedBalance}) => {
  return {
    default: {
      channelBalance: ({}, cbk) => cbk(null, {
        balance: '1',
        pending_open_balance: '1',
      }),
      listChannels: ({}, cbk) => cbk(null, listChannelsResponse),
      pendingChannels: ({}, cbk) => cbk(null, {
        pending_closing_channels: [],
        pending_force_closing_channels: [],
        pending_open_channels: [],
        total_limbo_balance: '1',
      }),
      walletBalance: ({}, cbk) => cbk(null, {
        confirmed_balance: '1',
        unconfirmed_balance: unconfirmedBalance || '1',
      }),
    },
  };
};

const tests = [
  {
    args: {},
    description: 'LND is required',
    error: [400, 'ExpectedLndToGetBalance'],
  },
  {
    args: {lnd: makeLnd({})},
    description: 'Get balances',
    expected: {balance: 5, channel_balance: 2},
  },
  {
    args: {is_offchain_only: true, lnd: makeLnd({})},
    description: 'Get balances offchain',
    expected: {balance: 3, channel_balance: 2},
  },
  {
    args: {lnd: makeLnd({unconfirmedBalance: '0'})},
    description: 'Get balances confirmed',
    expected: {balance: 4, channel_balance: 2},
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, equal, rejects}) => {
    if (!!error) {
      await rejects(getBalance(args), error, 'Got expected error');
    } else {
      const balances = await getBalance(args);

      equal(balances.balance, expected.balance, 'Balance is calculated');
      equal(balances.channel_balance, expected.channel_balance, 'Chan tokens');
    }

    return end();
  });
});
