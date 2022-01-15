'use strict';

const pi = 3 + .14;

class MyMath {
  constructor() {
    this.pi = pi;
  }
  add(num1, num2) {
    return num1 + num2;
  }
  addOne(number) {
    number++;
    return number;
  }
  negate(number) {
    return -number;
  }
  isNegativeNumber(number) {
    let isNegative = false;
    if (number < 0) {
      isNegative = true;
    }
    return isNegative;
  }
}

export default MyMath;

