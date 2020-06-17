// @ts-nocheck
var __global_69fa48 = function (g) {
  g.__mutationCoverage__ = g.__mutationCoverage__ || {
    static: {}
  };

  g.__coverMutant__ = g.__coverMutant__ || function () {
    var c = g.__mutationCoverage__.static;

    if (g.__currentTestId__) {
      c = g.__mutationCoverage__[g.__currentTestId__];
    }

    var a = arguments;

    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  };

  return g;
}(new Function("return this")());

var add = function (num1, num2) {
  switch (__global_69fa48.__activeMutant__) {
    case 0:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(0);
      {
        return __global_69fa48.__activeMutant__ === 1 ? num1 - num2 : (__global_69fa48.__coverMutant__(1), num1 + num2);
      }
      break;
  }
};

var addOne = function (number) {
  switch (__global_69fa48.__activeMutant__) {
    case 2:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(2);
      {
        number++;
        return number;
      }
      break;
  }
};

var negate = function (number) {
  switch (__global_69fa48.__activeMutant__) {
    case 3:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(3);
      {
        return -number;
      }
      break;
  }
};

var isNegativeNumber = function (number) {
  switch (__global_69fa48.__activeMutant__) {
    case 4:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(4);
      {
        var isNegative = false;

        if (__global_69fa48.__activeMutant__ === 6 ? false : __global_69fa48.__activeMutant__ === 5 ? true : (__global_69fa48.__coverMutant__(5, 6), number < 0)) {
          switch (__global_69fa48.__activeMutant__) {
            case 7:
              {}
              break;

            default:
              __global_69fa48.__coverMutant__(7);
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
