const chai = require('chai');

chai.util.addMethod(chai.Assertion.prototype, 'toEqual', function (expected) {
  var obj = chai.util.flag(this, 'object');
  new chai.Assertion(obj).to.deep.equal(expected);
});
