const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('chai');
const { MyMath } = require('../../src/math');

const myMath = new MyMath();

Given('input myMath.pi', function() {
  this.value = myMath.pi;
});

Given('input MyMath.pi', function() {
  this.value = MyMath.pi;
});

Given('input {int}', function (input) {
  this.value = input;
});

When('add with {int}', function (other) {
  this.value = myMath.add(this.value, other);
});

Then('the result should be {string}', function (expected) {
  expect(this.value).eq(expected);
});
Then('the result should be {float}', function (expected) {
  expect(this.value).eq(expected);
});
