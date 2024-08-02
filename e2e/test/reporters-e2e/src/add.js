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

export function notCovered(number) {
  return number > 10;
}

export function isNegativeNumber(number) {
  var isNegative = false;
  if(number < 0){
    isNegative = true;
  }
  return isNegative;
}


