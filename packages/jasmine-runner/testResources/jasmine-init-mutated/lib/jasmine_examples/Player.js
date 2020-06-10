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

function Player() {
  switch (__global_69fa48.__activeMutant__) {
    case 0:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(0);
      {}
      break;
  }
}

Player.prototype.play = function (song) {
  switch (__global_69fa48.__activeMutant__) {
    case 1:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(1);
      {
        this.currentlyPlayingSong = song;
        this.isPlaying = true;
      }
      break;
  }
};

Player.prototype.pause = function () {
  switch (__global_69fa48.__activeMutant__) {
    case 2:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(2);
      {
        this.isPlaying = false;
      }
      break;
  }
};

Player.prototype.resume = function () {
  switch (__global_69fa48.__activeMutant__) {
    case 3:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(3);
      {
        if (__global_69fa48.__activeMutant__ === 5 ? false : __global_69fa48.__activeMutant__ === 4 ? true : (__global_69fa48.__coverMutant__(4, 5), this.isPlaying)) {
          switch (__global_69fa48.__activeMutant__) {
            case 6:
              {}
              break;

            default:
              __global_69fa48.__coverMutant__(6);
              {
                throw new Error(__global_69fa48.__activeMutant__ === 7 ? "" : (__global_69fa48.__coverMutant__(7), "song is already playing"));
              }
              break;
          }
        }

        this.isPlaying = true;
      }
      break;
  }
};

Player.prototype.makeFavorite = function () {
  switch (__global_69fa48.__activeMutant__) {
    case 8:
      {}
      break;

    default:
      __global_69fa48.__coverMutant__(8);
      {
        this.currentlyPlayingSong.persistFavoriteStatus(true);
      }
      break;
  }
};

module.exports = Player;
