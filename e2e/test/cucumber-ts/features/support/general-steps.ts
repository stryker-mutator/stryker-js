import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';
import { deserialize, serialize } from '../../src/index.js';

class Person {
  constructor(public name: string, public age: number){}
}

Given('an input {int}', function (n) {
  this.input = n;
});
Given('an input {boolean}', function (b) {
  this.input = b;
});
Given('an input {string}', function (s) {
  this.input = s;
});
Given('an input null', function () {
  this.input = null;
});
Given('a js value {string}', function (json) {
  this.input = eval(`(${json})`);
});
When('I serialize', function () {
  this.result = serialize(this.input, );
});
When('I serialize with Person as known class', function () {
  this.result = serialize(this.input, [Person]);
});
When('I deserialize', function () {
  this.result = deserialize(this.input);
});
When('I deserialize with Person as known class', function () {
  this.result = deserialize(this.input, [Person]);
});
Then('the result is {string}', function (expected) {
  expect(this.result).deep.eq(expected);
});
Then('the result is {int}', function (expected) {
  expect(this.result).deep.eq(expected);
});
Then('the result is {boolean}', function (expected) {
  expect(this.result).deep.eq(expected);
});
Then('the result is null', function () {
  expect(this.result).is.null;
});
Then('the result is js value {string}', function (js) {
  expect(this.result).deep.eq(eval(`(${js})`));
});
