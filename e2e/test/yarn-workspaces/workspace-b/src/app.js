const workspace = require('workspace-a');

exports.concatWithFoo = (msg) => {
  return workspace + ': ' + msg;
}
