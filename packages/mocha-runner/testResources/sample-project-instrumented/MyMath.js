// This file is generated with tasks/instrument-test-resources.js
 function stryNS_9fa48() {
  var g = new Function("return this")();
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

const pi = stryMutAct_9fa48("0") ? 3 - .14 : (stryCov_9fa48("0"), 3 + .14);

function MyMath() {
  if (stryMutAct_9fa48("1")) {
    {}
  } else {
    stryCov_9fa48("1");
    this.pi = pi;
  }
}

MyMath.prototype.add = function (num1, num2) {
  if (stryMutAct_9fa48("2")) {
    {}
  } else {
    stryCov_9fa48("2");
    return stryMutAct_9fa48("3") ? num1 - num2 : (stryCov_9fa48("3"), num1 + num2);
  }
};

MyMath.prototype.addOne = function (number) {
  if (stryMutAct_9fa48("4")) {
    {}
  } else {
    stryCov_9fa48("4");
    stryMutAct_9fa48("5") ? number-- : (stryCov_9fa48("5"), number++);
    return number;
  }
};

MyMath.prototype.negate = function (number) {
  if (stryMutAct_9fa48("6")) {
    {}
  } else {
    stryCov_9fa48("6");
    return stryMutAct_9fa48("7") ? +number : (stryCov_9fa48("7"), -number);
  }
};

MyMath.prototype.isNegativeNumber = function (number) {
  if (stryMutAct_9fa48("8")) {
    {}
  } else {
    stryCov_9fa48("8");
    var isNegative = stryMutAct_9fa48("9") ? true : (stryCov_9fa48("9"), false);

    if (stryMutAct_9fa48("13") ? number >= 0 : stryMutAct_9fa48("12") ? number <= 0 : stryMutAct_9fa48("11") ? false : stryMutAct_9fa48("10") ? true : (stryCov_9fa48("10", "11", "12", "13"), number < 0)) {
      if (stryMutAct_9fa48("14")) {
        {}
      } else {
        stryCov_9fa48("14");
        isNegative = stryMutAct_9fa48("15") ? false : (stryCov_9fa48("15"), true);
      }
    }

    return isNegative;
  }
};

export default MyMath;