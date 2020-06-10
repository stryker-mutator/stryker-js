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

function Song() {
  switch (__global_69fa48.__activeMutant__) {
    case 9:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(9);
      {}
      break;
  }
}

Song.prototype.persistFavoriteStatus = function (value) {
  switch (__global_69fa48.__activeMutant__) {
    case 10:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(10);
      {
        // something complicated
        throw new Error(__global_69fa48.__activeMutant__ === 11 ? "" : (__global_69fa48.__coverMutant__(11), "not yet implemented"));
      }
      break;
  }
};

module.exports = Song;
