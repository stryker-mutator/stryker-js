import { util, Assertion, expect } from 'chai';

util.addMethod(Assertion.prototype, 'toEqual', function (expected) {
  var obj = util.flag(this, 'object');
  new Assertion(obj).to.deep.equal(expected);
});

global.expect = expect;
