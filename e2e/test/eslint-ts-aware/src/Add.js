#! /usr/bin/env node

/**
 * Adds two numbers
 *
 * @param {number} num1
 * @param {number} num2
 * @returns {number}
 */
module.exports.add = function (num1, num2) {
  return num1 + num2;
};

/**
 * Increments a number
 *
 * @param {number} number
 * @returns {number}
 */
module.exports.addOne = function (number) {
  number++;
  return number;
};

/**
 * Returns the negative of a number
 *
 * @param {number} number
 * @returns {number}
 */
module.exports.negate = function (number) {
  return -number;
};

/**
 * This function exists to not be tested
 *
 * @param {number} number
 * @returns {number}
 */
module.exports.notCovered = function (number) {
  return number > 10;
};

/**
 * Returns true if the number is negative
 *
 * @param {number} number
 * @returns {boolean}
 */
module.exports.isNegativeNumber = function (number) {
  var isNegative = false;
  if (number < 0) {
    isNegative = true;
  }
  return isNegative;
};
