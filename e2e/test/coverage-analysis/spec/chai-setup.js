import chai from 'chai';

globalThis.expect = chai.expect;
chai.util.addMethod(chai.Assertion.prototype, 'toEqual', function (expected) {
  var obj = chai.util.flag(this, 'object');
  new chai.Assertion(obj).to.deep.equal(expected);
});
chai.util.addMethod(chai.Assertion.prototype, 'toBe', function (expected) {
  var obj = chai.util.flag(this, 'object');
  new chai.Assertion(obj).to.equal(expected);
});
