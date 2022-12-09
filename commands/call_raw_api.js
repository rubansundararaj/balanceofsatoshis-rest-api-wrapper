const {parse} = require('querystring');

const asyncAuto = require('async/auto');
const asyncMapSeries = require('async/mapSeries');
const lnService = require('ln-service');
const {returnResult} = require('asyncjs-util');

const {calls} = require('./api');

const {assign} = Object;
const isChannel = n => !!n && /^\d*x\d*x\d*$/.test(n);
const isHash = n => !!n && /^[0-9A-F]{64}$/i.test(n);
const isPublicKey = n => !!n && /^0[2-3][0-9A-F]{64}$/i.test(n);
const {keys} = Object;
const lower = n => n.toLowerCase();
const methodDetails = (calls, method) => calls.find(n => n.method === method);

/** Call the raw API

  {
    ask: <Inquirer Function> ({message, name, type}, cbk) => {}
    lnd: <Authenticated LND API Object>
    logger: <Winston Logger Object>
    [method]: <Method to Call String>
    [params]: [<Querystring Encoded Parameter String>]
  }

  @returns via cbk or Promise
  <Result Object>
*/
module.exports = ({ask, lnd, logger, method, params}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Check arguments
      validate: cbk => {
        if (!ask) {
          return cbk([400, 'ExpectedAskFunctionToCallApi']);
        }

        if (!lnd) {
          return cbk([400, 'ExpectedAuthenticatedLndToCallApi']);
        }

        if (!logger) {
          return cbk([400, 'ExpectedLoggerToCallApi']);
        }

        if (!!method && !calls.find(n => lower(n.method) === lower(method))) {
          return cbk([404, 'UnrecognizedMethod']);
        }

        return cbk();
      },

      // Get method
      getMethod: ['validate', ({}, cbk) => {
        // Exit early when a method was preselected
        if (!!method) {
          const call = calls.find(n => lower(n.method) === lower(method));

          return cbk(null, {method: call.method});
        }

        return ask({
          choices: calls.map(n => n.method),
          loop: false,
          message: 'Select method to call',
          name: 'method',
          type: 'list',
        },
        method => cbk(null, method));
      }],

      // Get method arguments
      getArguments: ['getMethod', ({getMethod}, cbk) => {
        const {arguments} = calls.find(n => n.method === getMethod.method);

        // Exit early when there are no arguments for this method
        if (!arguments) {
          return cbk(null, []);
        }

        const parameters = (params || [])
          .map(encoded => parse(encoded))
          .reduce((sum, n) => assign(sum, n), {});

        // Parameters must all match method parameters
        const unknown = keys(parameters).find(param => {
          return !arguments.find(({named}) => named === param);
        });

        if (!!unknown) {
          return cbk([400, 'UnknownParameterProvided', {unknown}]);
        }

        return asyncMapSeries(arguments, (argument, cbk) => {
          const {named} = argument;

          if (!!parameters[named] && argument.type === 'boolean') {
            return cbk(null, {[named]: parameters[named] === 'true'});
          }

          if (parameters[named] !== undefined) {
            return cbk(null, {[named]: parameters[named]});
          }

          if (argument.type === 'boolean') {
            return ask({
              default: false,
              name: named,
              message: argument.description,
              prefix: `[${named}]`,
              type: 'confirm',
            },
            res => cbk(null, res));
          }

          return ask({
            default: () => !!argument.optional ? String() : undefined,
            message: argument.description,
            name: named,
            prefix: `[${named}]`,
            suffix: !!argument.optional ? ' (Optional)' : String(),
            type: argument.type || 'input',
            validate: input => {
              const isNumber = argument.type === 'number';

              // Exit early on number zero
              if (!argument.optional && isNumber && input === Number()) {
                return true;
              }

              // Exit early when providing nothing to a required argument
              if (!argument.optional && !input) {
                return 'Required parameter';
              }

              // Exit early when providing nothing to an optional argument
              if (!!argument.optional && !input) {
                return true;
              }

              // Channels must be standard format encoded
              if (argument.type === 'channel' && !isChannel(input)) {
                return 'A standard format channel id is required';
              }

              // Hashes must be hex encoded 32 byte hashes
              if (argument.type === 'hash' && !isHash(input)) {
                return 'A hex encoded 32 byte hash is required';
              }

              // Public keys must be hex public keys
              if (argument.type === 'public_key' && !isPublicKey(input)) {
                return 'A public key is required';
              }

              return true;
            },
          },
          res => cbk(null, res));
        },
        cbk);
      }],

      // Derive arguments
      arguments: ['getArguments', ({getArguments}, cbk) => {
        const arguments = getArguments.reduce((sum, answer) => {
          keys(answer).forEach(key => {
            if (answer[key] === Number()) {
              sum[key] = Number();
            } else {
              sum[key] = answer[key] || undefined;
            }
          });

          return sum;
        },
        {lnd});

        return cbk(null, arguments);
      }],

      // Set up subscription
      subscribe: ['arguments', 'getMethod', ({arguments, getMethod}, cbk) => {
        // Exit early when this is a request/response API
        if (!methodDetails(calls, getMethod.method).events) {
          return cbk();
        }

        const sub = lnService[getMethod.method](arguments);

        sub.on('error', err => cbk([503, 'ApiSubscriptionError', {err}]));

        const {events} = methodDetails(calls, getMethod.method);

        logger.info({listening_for: events});

        events.forEach(n => sub.on(n, data => logger.info({[n]: data})));
      }],

      // Call API
      call: ['arguments', 'getMethod', ({arguments, getMethod}, cbk) => {
        // Exit early when this is an event-based API
        if (!!methodDetails(calls, getMethod.method).events) {
          return cbk();
        }

        return lnService[getMethod.method](arguments, cbk);
      }],
    },
    returnResult({reject, resolve, of: 'call'}, cbk));
  });
};
