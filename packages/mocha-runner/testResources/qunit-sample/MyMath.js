'use strict';

class MyMath {
  constructor() {}
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
    var isNegative = false;
    if (number < 0) {
      isNegative = true;
    }
    return isNegative;
  }
}

export default MyMath;
