export function add(num1, num2) {
  return num1 + num2;
}

export function addOne(number) {
  number++;
  return number;
}

export function negate(number) {
  return -number;
}

export function isNegativeNumber(number) {
  var isNegative = false;
  if (number < 0) {
    isNegative = true;
  }
  return isNegative;
}

export function multiply(num1, num2) {
  return num1 * num2;
}

export function subtract(num1, num2) {
  return num1 - num2;
}

export function isPositive(number) {
  return number > 0;
}

export function absolute(number) {
  if (number < 0) {
    return -number;
  }
  return number;
}

export function max(a, b) {
  if (a >= b) {
    return a;
  }
  return b;
}

export function min(a, b) {
  if (a <= b) {
    return a;
  }
  return b;
}
