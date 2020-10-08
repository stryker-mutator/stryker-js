// This file is generated with tasks/instrument-test-resources.js
 var stryNS_9fa48 = function() {
  var g = new Function("return this")();
  var ns = g.__stryker2__ || (g.__stryker2__ = {});

  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = Number(g.process.env.__STRYKER_ACTIVE_MUTANT__);
  }

  function retrieveNS() {
    return ns;
  }

  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}

stryNS_9fa48();

var stryCov_9fa48 = function(...args) {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });

  function cover(...a) {
    var c = cov.static;

    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }

    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }

  stryCov_9fa48 = cover;
  cover.apply(null, args);
}

function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();

  function isActive(id) {
    return ns.activeMutant === id;
  }

  stryMutAct_9fa48 = isActive;
  return isActive(id);
}

function Player() {}

Player.prototype.play = function (song) {
  if (stryMutAct_9fa48(0)) {
    {}
  } else {
    stryCov_9fa48(0);
    this.currentlyPlayingSong = song;
    this.isPlaying = stryMutAct_9fa48(1) ? false : (stryCov_9fa48(1), true);
  }
};

Player.prototype.pause = function () {
  if (stryMutAct_9fa48(2)) {
    {}
  } else {
    stryCov_9fa48(2);
    this.isPlaying = stryMutAct_9fa48(3) ? true : (stryCov_9fa48(3), false);
  }
};

Player.prototype.resume = function () {
  if (stryMutAct_9fa48(4)) {
    {}
  } else {
    stryCov_9fa48(4);

    if (stryMutAct_9fa48(6) ? false : stryMutAct_9fa48(5) ? true : (stryCov_9fa48(5, 6), this.isPlaying)) {
      if (stryMutAct_9fa48(7)) {
        {}
      } else {
        stryCov_9fa48(7);
        throw new Error(stryMutAct_9fa48(8) ? "" : (stryCov_9fa48(8), "song is already playing"));
      }
    }

    this.isPlaying = stryMutAct_9fa48(9) ? false : (stryCov_9fa48(9), true);
  }
};

Player.prototype.makeFavorite = function () {
  if (stryMutAct_9fa48(10)) {
    {}
  } else {
    stryCov_9fa48(10);
    this.currentlyPlayingSong.persistFavoriteStatus(stryMutAct_9fa48(11) ? false : (stryCov_9fa48(11), true));
  }
}; // Add random string, resulting in a static mutant in the instrumented code.


module.exports.foo = stryMutAct_9fa48(12) ? "" : (stryCov_9fa48(12), 'bar');
module.exports = Player;
