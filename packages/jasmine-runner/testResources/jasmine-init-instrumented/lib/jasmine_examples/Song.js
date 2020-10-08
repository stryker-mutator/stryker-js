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

function Song() {}

Song.prototype.persistFavoriteStatus = function (value) {
  if (stryMutAct_9fa48(13)) {
    {}
  } else {
    stryCov_9fa48(13);
    // something complicated
    throw new Error(stryMutAct_9fa48(14) ? "" : (stryCov_9fa48(14), "not yet implemented"));
  }
};

module.exports = Song;
