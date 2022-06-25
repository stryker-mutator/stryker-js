
class Calculator {
  value = 0;

  setTo(n) {
    this.value = n;
  }

  incrementBy(n) {
    this.value = this.value + n;
  }

  multiplyBy(n) {
    this.value = this.value * n;
  }
}

module.exports = { Calculator };
