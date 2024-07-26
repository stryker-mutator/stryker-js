import { expect, Assertion, util } from 'chai';

globalThis.expect = expect;
util.addMethod(Assertion.prototype, 'toEqual', function (expected) {
  var obj = util.flag(this, 'object');
  new Assertion(obj).to.deep.equal(expected);
});
util.addMethod(Assertion.prototype, 'toBe', function (expected) {
  var obj = util.flag(this, 'object');
  new Assertion(obj).to.equal(expected);
});
