#! /usr/bin/env node
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

module.exports.isNegativeNumber = function (number) {
  var isNegative = false;
  if (number < 0) {
    isNegative = true;
  }
  return isNegative;
};

const hi = '👋';
module.exports.sayHello = function (name) {
  return `${hi} ${name}`;
};
