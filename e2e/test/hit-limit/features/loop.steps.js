const { Given, When, Then } = require('@cucumber/cucumber');
const { loop } = require('../src/loop');
const { expect } = require('chai');

Given('a sum function', function () {
  this.function = (n) => (this.result += n);
});

When('I loop {int} times', function (n) {
  this.result = 0;
  loop(n, this.function);
});

Then('the result should be {int}', function (result) {
  expect(this.result).to.eq(result);
});
