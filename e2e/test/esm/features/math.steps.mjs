import { When, Then } from '@cucumber/cucumber';
import { add, inc, greet } from '../src/lib.js';
import { expect } from 'chai';

When('I add {int} and {int}', function (n, n2) {
  this.result = add(n, n2);
});

When('I greet {string}', function(subject) {
  this.result = greet(subject);
});

When('I inc {int}', function (n) {
  this.result = inc(n);
});

Then('I get {int}', function (expected) {
  expect(this.result).eq(expected);
});
Then('I get {string}', function (expected) {
  expect(this.result).eq(expected);
});
