
const localPackage = require("./../package.json")

exports.concatWithFoo = (msg) => {
  return localPackage.name + ': ' + msg;
}
