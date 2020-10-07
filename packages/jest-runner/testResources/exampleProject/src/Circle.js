// @ts-nocheck
var __global_69fa48 = (function(g){
  if (g.__activeMutant__ === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    g.__activeMutant__ = Number(g.process.env.__STRYKER_ACTIVE_MUTANT__);
  }
  g.__mutantCoverage__ = g.__mutantCoverage__ || { static: {}, perTest: {} };
  g.__coverMutant__ = g.__coverMutant__ || function () {
    var c = g.__mutantCoverage__.static;
    if (g.__currentTestId__) {
      c = g.__mutantCoverage__.perTest[g.__currentTestId__] =  g.__mutantCoverage__.perTest[g.__currentTestId__] || {};
    }
    var a = arguments;
    for(var i=0; i < a.length; i++){
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  };
  return g;
})(new Function("return this")())

exports.getCircumference = function (radius) {
  switch (__global_69fa48.__activeMutant__) {
    case 8:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(8);
      {
        //Function to test multiple math mutations in a single function.
        return __global_69fa48.__activeMutant__ === 9 ? 2 * Math.PI / radius : (__global_69fa48.__coverMutant__(9), (__global_69fa48.__activeMutant__ === 10 ? 2 / Math.PI : (__global_69fa48.__coverMutant__(10), 2 * Math.PI)) * radius);
      }
      break;
  }
};

var untestedFunction = function () {
  switch (__global_69fa48.__activeMutant__) {
    case 11:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(11);
      {
        var i = __global_69fa48.__activeMutant__ === 12 ? 5 / 2 / 3 : (__global_69fa48.__coverMutant__(12), (__global_69fa48.__activeMutant__ === 13 ? 5 * 2 : (__global_69fa48.__coverMutant__(13), 5 / 2)) * 3);
      }
      break;
  }
};
