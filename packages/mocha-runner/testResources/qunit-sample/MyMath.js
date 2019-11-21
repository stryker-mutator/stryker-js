'use strict';

function MyMath() {

}

MyMath.prototype.add = function(num1, num2) {
  return num1 + num2;
};

MyMath.prototype.addOne = function(number) {
  number++;
  return number;
};

MyMath.prototype.negate = function(number) {
  return -number;
};

MyMath.prototype.isNegativeNumber = function(number) {
  var isNegative = false;
  if(number < 0){
    isNegative = true;
  }
  return isNegative;
};

module.exports = MyMath;

