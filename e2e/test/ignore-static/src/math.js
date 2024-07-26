export class MyMath {
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
