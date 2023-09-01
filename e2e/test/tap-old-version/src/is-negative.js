/**
 * @param {number} n 
 * @returns 
 */
module.exports.isNegativeNumber = function isNegativeNumber(n) {
  var isNegative = false;
  if (n < 0) {
    isNegative = true;
  }
  return isNegative;
}
