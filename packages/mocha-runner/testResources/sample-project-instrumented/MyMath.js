// @ts-nocheck
'use strict';

var __global_69fa48 = function (g) {
  g.__mutantCoverage__ = g.__mutantCoverage__ || {
    static: {},
    perTest: {}
  };

  g.__coverMutant__ = g.__coverMutant__ || function () {
    var c = g.__mutantCoverage__.static;

    if (g.__currentTestId__) {
      c = g.__mutantCoverage__.perTest[g.__currentTestId__] = g.__mutantCoverage__.perTest[g.__currentTestId__] || {};
    }

    var a = arguments;

    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  };

  return g;
}(new Function("return this")());

const pi = __global_69fa48.__activeMutant__ === 0 ? 3 - .14 : (__global_69fa48.__coverMutant__(0), 3 + .14);

function MyMath() {
  switch (__global_69fa48.__activeMutant__) {
    case 1:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(1);
      {}
      break;
  }
}

MyMath.prototype.add = function (num1, num2) {
  switch (__global_69fa48.__activeMutant__) {
    case 2:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(2);
      {
        return __global_69fa48.__activeMutant__ === 3 ? num1 - num2 : (__global_69fa48.__coverMutant__(3), num1 + num2);
      }
      break;
  }
};

MyMath.prototype.addOne = function (number) {
  switch (__global_69fa48.__activeMutant__) {
    case 4:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(4);
      {
        number++;
        return number;
      }
      break;
  }
};

MyMath.prototype.negate = function (number) {
  switch (__global_69fa48.__activeMutant__) {
    case 5:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(5);
      {
        return -number;
      }
      break;
  }
};

MyMath.prototype.isNegativeNumber = function (number) {
  switch (__global_69fa48.__activeMutant__) {
    case 6:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(6);
      {
        var isNegative = false;

        if (__global_69fa48.__activeMutant__ === 8 ? false : __global_69fa48.__activeMutant__ === 7 ? true : (__global_69fa48.__coverMutant__(7, 8), number < 0)) {
          switch (__global_69fa48.__activeMutant__) {
            case 9:
              {}
              break;

            default:
              __global_69fa48.__coverMutant__(9);
              {
                isNegative = true;
              }
              break;
          }
        }

        return isNegative;
      }
      break;
  }
};

module.exports = MyMath;