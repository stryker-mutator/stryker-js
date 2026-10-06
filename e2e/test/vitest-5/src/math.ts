export function add(num1: number, num2: number) {
  return num1 + num2;
}

export function addOne(number: number) {
  number++;
  return number;
}

export function negate(number: number) {
  return -number;
}

export function isNegativeNumber(number: number) {
  var isNegative = false;
  if (number < 0) {
    isNegative = true;
  }
  return isNegative;
}
