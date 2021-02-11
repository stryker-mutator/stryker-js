const foo = require('foo');

exports.concatWithFoo = (msg) => {
  return foo + ': ' + msg;
}
