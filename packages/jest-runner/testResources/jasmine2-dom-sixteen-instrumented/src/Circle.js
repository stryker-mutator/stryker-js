// This file is generated with tasks/instrument-test-resources.js
 function stryNS_9fa48() {
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
    return ns.activeMutant === id;
  }

  stryMutAct_9fa48 = isActive;
  return isActive(id);
}

class CircleElement extends HTMLElement {
  get circumference() {
    if (stryMutAct_9fa48(23)) {
      {}
    } else {
      stryCov_9fa48(23);
      return stryMutAct_9fa48(24) ? 2 * Math.PI / Number(this.getAttribute(stryMutAct_9fa48(26) ? "" : (stryCov_9fa48(26), 'radius'))) : (stryCov_9fa48(24), (stryMutAct_9fa48(25) ? 2 / Math.PI : (stryCov_9fa48(25), 2 * Math.PI)) * Number(this.getAttribute(stryMutAct_9fa48(26) ? "" : (stryCov_9fa48(26), 'radius'))));
    }
  }

  untestedFunction() {
    if (stryMutAct_9fa48(27)) {
      {}
    } else {
      stryCov_9fa48(27);
      return stryMutAct_9fa48(28) ? 5 / 2 / 3 : (stryCov_9fa48(28), (stryMutAct_9fa48(29) ? 5 * 2 : (stryCov_9fa48(29), 5 / 2)) * 3);
    }
  }

}

customElements.define(stryMutAct_9fa48(30) ? "" : (stryCov_9fa48(30), 'my-circle'), CircleElement);