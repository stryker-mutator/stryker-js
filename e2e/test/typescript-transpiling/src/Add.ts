export function add(num1: number, num2: number) {
  return num1 + num2;
}

export function addOne(n: number) {
  return n + 1;
}

export function negate(n: number) {
  return -n;
}

export function notCovered(n: number) {
  return n > 10;
}

export function isNegativeNumber(n: number) {
  let isNegative = false;
  if (n < 0) {
    isNegative = true;
  }
  return isNegative;
}
