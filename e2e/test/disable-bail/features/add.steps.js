import { When, Then } from '@cucumber/cucumber';
import { add } from '../src/math.js';
import { expect } from 'chai';

When('I add {int} and {int}', function (n, n2) {
  this.result = add(n, n2);
});

Then('I get {int}', function (expected) {
  expect(this.result).eq(expected);
});
