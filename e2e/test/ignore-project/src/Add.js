export function add (num1, num2) {
  console.log('Add' + 'called');
  return num1 + num2;
}

export function addOne (number) {
  number++;
  console.log('add one called');
  return number;
}

export function negate (number) {
  console.log('negate called');
  return -number;
}

export function notCovered (number) {
  console.warn('not covered!');
  return number > 10;
}

export function userNextLineIgnored (number) {
  // Stryker disable next-line all: Ignoring this on purpose
  return number > 10;
}

// Stryker disable all
export function blockUserIgnored (number) {
  return number > 10;
}
// Stryker restore all

export function userNextLineSpecificMutator (number) {
  // Stryker disable next-line BooleanLiteral, ConditionalExpression: Ignore boolean and conditions
  return true && number > 10;
}


export function isNegativeNumber (number) {
  var isNegative = false;
  if (number < 0) {
    isNegative = true;
  }
  return isNegative;
}
