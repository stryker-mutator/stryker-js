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

class CalculatorElement extends HTMLElement {
  connectedCallback() {
    if (stryMutAct_9fa48(0)) {
      {}
    } else {
      stryCov_9fa48(0);

      switch (this.getAttribute(stryMutAct_9fa48(1) ? "" : (stryCov_9fa48(1), 'operator'))) {
        case stryMutAct_9fa48(3) ? "" : (stryCov_9fa48(3), 'add'):
          if (stryMutAct_9fa48(2)) {} else {
            stryCov_9fa48(2);
            this.innerHTML = stryMutAct_9fa48(4) ? Number(this.getAttribute(stryMutAct_9fa48(5) ? "" : (stryCov_9fa48(5), 'a'))) - Number(this.getAttribute(stryMutAct_9fa48(6) ? "" : (stryCov_9fa48(6), 'b'))) : (stryCov_9fa48(4), Number(this.getAttribute(stryMutAct_9fa48(5) ? "" : (stryCov_9fa48(5), 'a'))) + Number(this.getAttribute(stryMutAct_9fa48(6) ? "" : (stryCov_9fa48(6), 'b'))));
            break;
          }

        case stryMutAct_9fa48(8) ? "" : (stryCov_9fa48(8), 'addOne'):
          if (stryMutAct_9fa48(7)) {} else {
            stryCov_9fa48(7);
            this.innerHTML = stryMutAct_9fa48(9) ? Number(this.getAttribute(stryMutAct_9fa48(10) ? "" : (stryCov_9fa48(10), 'a'))) - 1 : (stryCov_9fa48(9), Number(this.getAttribute(stryMutAct_9fa48(10) ? "" : (stryCov_9fa48(10), 'a'))) + 1);
            break;
          }

        case stryMutAct_9fa48(12) ? "" : (stryCov_9fa48(12), 'negate'):
          if (stryMutAct_9fa48(11)) {} else {
            stryCov_9fa48(11);
            this.innerHTML = stryMutAct_9fa48(13) ? +Number(this.getAttribute(stryMutAct_9fa48(14) ? "" : (stryCov_9fa48(14), 'a'))) : (stryCov_9fa48(13), -Number(this.getAttribute(stryMutAct_9fa48(14) ? "" : (stryCov_9fa48(14), 'a'))));
            break;
          }

        case stryMutAct_9fa48(16) ? "" : (stryCov_9fa48(16), 'isNegative'):
          if (stryMutAct_9fa48(15)) {} else {
            stryCov_9fa48(15);
            const a = Number(this.getAttribute(stryMutAct_9fa48(17) ? "" : (stryCov_9fa48(17), 'a')));
            this.innerHTML = stryMutAct_9fa48(21) ? a >= 0 : stryMutAct_9fa48(20) ? a <= 0 : stryMutAct_9fa48(19) ? false : stryMutAct_9fa48(18) ? true : (stryCov_9fa48(18, 19, 20, 21), a < 0);
            break;
          }

      }
    }
  }

}

customElements.define(stryMutAct_9fa48(22) ? "" : (stryCov_9fa48(22), 'my-calculator'), CalculatorElement);