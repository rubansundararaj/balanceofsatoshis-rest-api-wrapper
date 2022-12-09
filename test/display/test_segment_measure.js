const {test} = require('@alexbosworth/tap');

const {segmentMeasure} = require('./../../display');

const tests = [
  {
    args: {days: 91},
    description: 'Days exceeds max',
    expected: {measure: 'week', segments: 13},
  },
  {
    args: {days: 3},
    description: 'Days below min',
    expected: {measure: 'hour', segments: 72},
  },
  {
    args: {days: 4},
    description: 'Regular days',
    expected: {measure: 'day', segments: 4},
  },
];

tests.forEach(({args, description, expected}) => {
  return test(description, ({end, strictSame}) => {
    strictSame(segmentMeasure(args), expected, 'Got expected result');

    return end();
  });
});
