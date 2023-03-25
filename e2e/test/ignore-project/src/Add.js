module.exports.add = function (num1, num2) {
  return num1 + num2;
};

module.exports.addOne = function (number) {
  number++;
  return number;
};

module.exports.negate = function (number) {
  return -number;
};

module.exports.notCovered = function (number) {
  return number > 10;
};

module.exports.userNextLineIgnored = function (number) {
  // Stryker disable next-line all: Ignoring this on purpose
  return number > 10;
};

// Stryker disable all
module.exports.blockUserIgnored = function (number) {
  return number > 10;
};
// Stryker restore all

module.exports.userNextLineSpecificMutator = function (number) {
  // Stryker disable next-line BooleanLiteral, ConditionalExpression: Ignore boolean and conditions
  return true && number > 10;
};


module.exports.isNegativeNumber = function (number) {
  var isNegative = false;
  if (number < 0) {
    isNegative = true;
  }
  return isNegative;
};
