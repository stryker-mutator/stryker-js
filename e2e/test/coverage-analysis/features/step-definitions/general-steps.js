import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { concat, greet } from '../../src/concat.js';
import { add, multiply } from '../../src/math.js';

Given('input {string}', function (input) {
  this.input = input;
});

Given('input {int}', function (input) {
  this.input = input;
});

When('concat with {string}', function (other) {
  this.result = concat(this.input, other);
});

When('I greet {string}', function (subject) {
  this.result = greet(subject);
});

When('add with {int}', function (other) {
  this.result = add(this.input, other);
});

When('multiplied with {int}', function (other) {
  this.result = multiply(this.input, other);
});

Then('the result should be {string}', function (expected) {
  expect(this.result).eq(expected);
});
Then('the result should be {int}', function (expected) {
  expect(this.result).eq(expected);
});
