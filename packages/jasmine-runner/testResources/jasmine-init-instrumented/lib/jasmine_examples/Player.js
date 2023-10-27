// This file is generated with tasks/instrument-test-resources.js
 function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker2__ || (g.__stryker2__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
function Player() {}
Player.prototype.play = function (song) {
  if (stryMutAct_9fa48("0")) {
    {}
  } else {
    stryCov_9fa48("0");
    this.currentlyPlayingSong = song;
    this.isPlaying = stryMutAct_9fa48("1") ? false : (stryCov_9fa48("1"), true);
  }
};
Player.prototype.pause = function () {
  if (stryMutAct_9fa48("2")) {
    {}
  } else {
    stryCov_9fa48("2");
    this.isPlaying = stryMutAct_9fa48("3") ? true : (stryCov_9fa48("3"), false);
  }
};
Player.prototype.resume = function () {
  if (stryMutAct_9fa48("4")) {
    {}
  } else {
    stryCov_9fa48("4");
    if (stryMutAct_9fa48("6") ? false : stryMutAct_9fa48("5") ? true : (stryCov_9fa48("5", "6"), this.isPlaying)) {
      if (stryMutAct_9fa48("7")) {
        {}
      } else {
        stryCov_9fa48("7");
        throw new Error(stryMutAct_9fa48("8") ? "" : (stryCov_9fa48("8"), "song is already playing"));
      }
    }
    this.isPlaying = stryMutAct_9fa48("9") ? false : (stryCov_9fa48("9"), true);
  }
};
Player.prototype.makeFavorite = function () {
  if (stryMutAct_9fa48("10")) {
    {}
  } else {
    stryCov_9fa48("10");
    this.currentlyPlayingSong.persistFavoriteStatus(stryMutAct_9fa48("11") ? false : (stryCov_9fa48("11"), true));
  }
};

// Add random string, resulting in a static mutant in the instrumented code.
module.exports.foo = stryMutAct_9fa48("12") ? "" : (stryCov_9fa48("12"), 'bar');
module.exports = Player;