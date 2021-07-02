// features/support/steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert').strict;
const { incrementBy } = require('../../src/calculator-static');

Given('a variable set to {int}', function (number) {
  this.calc.setTo(number);
});

When('I increment the variable by {int}', function (number) {
  this.calc.incrementBy(number);
});

When(
  'I increment the variable by {int} using the static calculator',
  function (val) {
    incrementBy(this.calc, val);
  }
);

Then('the variable should contain {int}', function (number) {
  assert.equal(this.calc.value, number);
});
