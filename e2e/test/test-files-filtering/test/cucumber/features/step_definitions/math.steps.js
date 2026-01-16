import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { add } from '../../../../src/math.js';

let a, b, result;

Given('I have numbers {int} and {int}', function (x, y) {
  a = x;
  b = y;
});

When('I add them', function () {
  result = add(a, b);
});

Then('the result should be {int}', function (expected) {
  expect(result).to.equal(expected);
});

Given('I do nothing', function () {
  void add; // Ensure related
});

Then('nothing happens', function () {
  expect(true).to.be.true;
});
