// This file is generated with tasks/instrument-test-resources.js
 var stryNS_9fa48 = function() {
  var g = new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});

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

var getCircumference = function (radius) {
  if (stryMutAct_9fa48(14)) {
    {}
  } else {
    stryCov_9fa48(14);
    //Function to test multiple math mutations in a single function.
    return stryMutAct_9fa48(15) ? 2 * Math.PI / radius : (stryCov_9fa48(15), (stryMutAct_9fa48(16) ? 2 / Math.PI : (stryCov_9fa48(16), 2 * Math.PI)) * radius);
  }
};

var untestedFunction = function () {
  if (stryMutAct_9fa48(17)) {
    {}
  } else {
    stryCov_9fa48(17);
    var i = stryMutAct_9fa48(18) ? 5 / 2 / 3 : (stryCov_9fa48(18), (stryMutAct_9fa48(19) ? 5 * 2 : (stryCov_9fa48(19), 5 / 2)) * 3);
  }
};
