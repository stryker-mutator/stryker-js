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

var add = function (num1, num2) {
  if (stryMutAct_9fa48(0)) {
    {}
  } else {
    stryCov_9fa48(0);
    return stryMutAct_9fa48(1) ? num1 - num2 : (stryCov_9fa48(1), num1 + num2);
  }
};

var addOne = function (number) {
  if (stryMutAct_9fa48(2)) {
    {}
  } else {
    stryCov_9fa48(2);
    stryMutAct_9fa48(3) ? number-- : (stryCov_9fa48(3), number++);
    return number;
  }
};

var negate = function (number) {
  if (stryMutAct_9fa48(4)) {
    {}
  } else {
    stryCov_9fa48(4);
    return stryMutAct_9fa48(5) ? +number : (stryCov_9fa48(5), -number);
  }
};

var isNegativeNumber = function (number) {
  if (stryMutAct_9fa48(6)) {
    {}
  } else {
    stryCov_9fa48(6);
    var isNegative = stryMutAct_9fa48(7) ? true : (stryCov_9fa48(7), false);

    if (stryMutAct_9fa48(11) ? number >= 0 : stryMutAct_9fa48(10) ? number <= 0 : stryMutAct_9fa48(9) ? false : stryMutAct_9fa48(8) ? true : (stryCov_9fa48(8, 9, 10, 11), number < 0)) {
      if (stryMutAct_9fa48(12)) {
        {}
      } else {
        stryCov_9fa48(12);
        isNegative = stryMutAct_9fa48(13) ? false : (stryCov_9fa48(13), true);
      }
    }

    return isNegative;
  }
};
