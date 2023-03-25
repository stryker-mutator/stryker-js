// features/support/steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert').strict;
const loop = require('../../src/infinite-loop');

Given('a sum function', function () {
  this.function = (n) => {
    assert.notEqual(n, 0);
    this.result += n;
  };
});

When('I loop {int} times', function (n) {
  this.result = 0;
  loop(n, this.function);
});

Then('the result should be {int}', function (result) {
  assert.equal(this.result, result);
});
