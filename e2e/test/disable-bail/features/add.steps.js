const { When, Then } = require('@cucumber/cucumber');
const { add } = require('../src/math');
const { expect } = require('chai');

When('I add {int} and {int}', function (n, n2) {
  this.result = add(n, n2);
});

Then('I get {int}', function (expected) {
  expect(this.result).eq(expected);
});
