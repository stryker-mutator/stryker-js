const { Given, When, Then } = require("@cucumber/cucumber");
const assert = require("assert").strict;


Given('a success step', () => {});
Then('a failed step', () => { throw new Error('Failed step') });
Then('an ambiguous step', () => {});
Then('a(n) ambiguous step', () => {});
Then('a pending step', () => 'pending');

Given("a variable set to {int}", function (number) {
  this.setTo(number);
});

When("I increment the variable by {int}", function (number) {
  this.incrementBy(number);
});

Then("the variable should contain {int}", function (number) {
  assert.equal(this.variable, number);
});
