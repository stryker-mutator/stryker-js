// features/support/world.js
const { setWorldConstructor } = require('@cucumber/cucumber');
const Calculator = require('../../src/calculator');

class CustomWorld {
  constructor() {
    this.calc = new Calculator();
  }

  setTo(number) {
    this.variable = number;
  }

  incrementBy(number) {
    this.variable += number;
  }
}

setWorldConstructor(CustomWorld);
