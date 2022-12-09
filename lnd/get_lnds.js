const asyncAuto = require('async/auto');
const asyncMap = require('async/map');
const {returnResult} = require('asyncjs-util');

const authenticatedLnd = require('./authenticated_lnd');

const flatten = arr => [].concat(...arr);
const uniq = arr => Array.from(new Set(arr));

/** Get LNDs for specified nodes

  {
    [logger]: <Winston Logger Object>
    [nodes]: <Node Name String> || [<Node Name String>]
  }

  @return via cbk or Promise
  {
    lnds: [<Authenticated LND API Object>]
  }
*/
module.exports = ({logger, nodes}, cbk) => {
  return new Promise((resolve, reject) => {
    return asyncAuto({
      // Default lnd
      getLnd: cbk => {
        if (!!nodes && !!nodes.length) {
          return cbk();
        }

        return authenticatedLnd({logger}, cbk);
      },

      // Authenticated LND Objects
      getLnds: cbk => {
        if (!nodes || !nodes.length) {
          return cbk();
        }

        const nodesList = uniq(flatten([nodes].filter(n => !!n)));

        return asyncMap(nodesList, (node, cbk) => {
          return authenticatedLnd({logger, node}, cbk);
        },
        cbk);
      },

      // Final lnds
      lnds: ['getLnd', 'getLnds', ({getLnd, getLnds}, cbk) => {
        if (!nodes || !nodes.length) {
          return cbk(null, {lnds: [getLnd.lnd]});
        }

        return cbk(null, {lnds: getLnds.map(n => n.lnd)});
      }],
    },
    returnResult({reject, resolve, of: 'lnds'}, cbk));
  });
};
