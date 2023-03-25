exports.add = function(num1, num2) {
  return num1 + num2;
};

exports.addOne = function(number) {
  number++;
  return number;
};

exports.negate = function(number) {
  return -number;
};

exports.isNegativeNumber = function(number) {
  var isNegative = false;
  if(number < 0){
    isNegative = true;
  }
  return isNegative;
};
