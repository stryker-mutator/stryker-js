var add = function(num1, num2) {
  return num1 + num2;
};

var addOne = function(number) {
  number++;
  return number;
};

var negate = function(number) {
  return -number;
};

var notCovered = function(number) {
  return number > 10;
};

var isNegativeNumber = function(number) {
  var isNegative = false;
  if(number < 0){
    isNegative = true;
  }
  return isNegative;
};

var isTrue = function(boolean) {
  return boolean === true;
};

var isFalse = function(boolean) {
  return boolean === false;
};

var getOppositeBoolean  = function(boolean) {
  if(!boolean){
    return true;
  } else {
    return false;
  }
};
