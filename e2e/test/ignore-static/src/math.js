
// Use `var` so it is declared on the `globalThis` in the browser
var MyMath = class MyMath {

  constructor() {
    // Hybrid mutant "0"
    this.pi = 3.14;
  }

  add(a, b) {
    // Non-static mutants: "1" and "2"
    return a + b;
  }

  // Static mutant "3"
  static pi = '🥧';
}



// Stryker disable all: Not useful for coverage analysis test
if (typeof module === 'object') {
  module.exports = { MyMath: MyMath };
}
