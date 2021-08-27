exports.multiply = function (num1, num2) {
  const add = require('./Add');
  let result = 0;
  for (let index = 0; index < num1; index++) {
    result += add(result, num2);
  }
  return result;
};
