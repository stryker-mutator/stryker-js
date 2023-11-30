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
type Operator = '+' | '-';
const operators = Object.freeze(new Set(stryMutAct_9fa48("7") ? [] : (stryCov_9fa48("7"), [stryMutAct_9fa48("8") ? "" : (stryCov_9fa48("8"), '+'), stryMutAct_9fa48("9") ? "" : (stryCov_9fa48("9"), '-')])));
const left = stryMutAct_9fa48("10") ? "" : (stryCov_9fa48("10"), 'left');
const right = stryMutAct_9fa48("11") ? "" : (stryCov_9fa48("11"), 'right');
const operator = stryMutAct_9fa48("12") ? "" : (stryCov_9fa48("12"), 'operator');
const plus = stryMutAct_9fa48("13") ? "" : (stryCov_9fa48("13"), '+');
const min = stryMutAct_9fa48("14") ? "" : (stryCov_9fa48("14"), '-');
const defaultOperator = plus;
export class MathComponent extends HTMLElement {
  #left = 0;
  #right = 0;
  #operator: Operator = defaultOperator;
  static observedAttributes = stryMutAct_9fa48("15") ? [] : (stryCov_9fa48("15"), [left, right]);
  connectedCallback() {
    if (stryMutAct_9fa48("16")) {
      {}
    } else {
      stryCov_9fa48("16");
      this.left = stryMutAct_9fa48("17") ? this.getAttribute(left) && 0 : (stryCov_9fa48("17"), this.getAttribute(left) ?? 0);
      this.right = stryMutAct_9fa48("18") ? this.getAttribute(right) && 0 : (stryCov_9fa48("18"), this.getAttribute(right) ?? 0);
      this.operator = stryMutAct_9fa48("19") ? this.getAttribute(operator) && defaultOperator : (stryCov_9fa48("19"), this.getAttribute(operator) ?? defaultOperator);
      this.render();
    }
  }
  attributeChangedCallback(name: string, _: string, newValue: string) {
    if (stryMutAct_9fa48("20")) {
      {}
    } else {
      stryCov_9fa48("20");
      if (stryMutAct_9fa48("23") ? name !== left : stryMutAct_9fa48("22") ? false : stryMutAct_9fa48("21") ? true : (stryCov_9fa48("21", "22", "23"), name === left)) {
        if (stryMutAct_9fa48("24")) {
          {}
        } else {
          stryCov_9fa48("24");
          this.left = newValue;
        }
      }
      if (stryMutAct_9fa48("27") ? name !== right : stryMutAct_9fa48("26") ? false : stryMutAct_9fa48("25") ? true : (stryCov_9fa48("25", "26", "27"), name === right)) {
        if (stryMutAct_9fa48("28")) {
          {}
        } else {
          stryCov_9fa48("28");
          this.right = newValue;
        }
      }
      if (stryMutAct_9fa48("31") ? name !== operator : stryMutAct_9fa48("30") ? false : stryMutAct_9fa48("29") ? true : (stryCov_9fa48("29", "30", "31"), name === operator)) {
        if (stryMutAct_9fa48("32")) {
          {}
        } else {
          stryCov_9fa48("32");
          this.operator = newValue;
        }
      }
    }
  }
  public get left(): number {
    if (stryMutAct_9fa48("33")) {
      {}
    } else {
      stryCov_9fa48("33");
      return this.#left;
    }
  }
  public set left(value: string | number) {
    if (stryMutAct_9fa48("34")) {
      {}
    } else {
      stryCov_9fa48("34");
      this.#left = stryMutAct_9fa48("35") ? -value : (stryCov_9fa48("35"), +value);
    }
  }
  public get right(): number {
    if (stryMutAct_9fa48("36")) {
      {}
    } else {
      stryCov_9fa48("36");
      return this.#right;
    }
  }
  public set right(value: string | number) {
    if (stryMutAct_9fa48("37")) {
      {}
    } else {
      stryCov_9fa48("37");
      this.#right = stryMutAct_9fa48("38") ? -value : (stryCov_9fa48("38"), +value);
      this.render();
    }
  }
  public get operator(): Operator {
    if (stryMutAct_9fa48("39")) {
      {}
    } else {
      stryCov_9fa48("39");
      return this.#operator;
    }
  }
  public set operator(value: string) {
    if (stryMutAct_9fa48("40")) {
      {}
    } else {
      stryCov_9fa48("40");
      if (stryMutAct_9fa48("42") ? false : stryMutAct_9fa48("41") ? true : (stryCov_9fa48("41", "42"), operators.has(value))) {
        if (stryMutAct_9fa48("43")) {
          {}
        } else {
          stryCov_9fa48("43");
          this.#operator = (value as Operator);
        }
      } else {
        if (stryMutAct_9fa48("44")) {
          {}
        } else {
          stryCov_9fa48("44");
          throw new Error(stryMutAct_9fa48("45") ? `` : (stryCov_9fa48("45"), `Value "${value}" is not a supported operator`));
        }
      }
      this.render();
    }
  }
  private get answer() {
    if (stryMutAct_9fa48("46")) {
      {}
    } else {
      stryCov_9fa48("46");
      switch (this.#operator) {
        case plus:
          if (stryMutAct_9fa48("47")) {} else {
            stryCov_9fa48("47");
            return stryMutAct_9fa48("48") ? this.left - this.right : (stryCov_9fa48("48"), this.left + this.right);
          }
        case min:
          if (stryMutAct_9fa48("49")) {} else {
            stryCov_9fa48("49");
            return stryMutAct_9fa48("50") ? this.left + this.right : (stryCov_9fa48("50"), this.left - this.right);
          }
      }
    }
  }
  public render() {
    if (stryMutAct_9fa48("51")) {
      {}
    } else {
      stryCov_9fa48("51");
      this.innerText = stryMutAct_9fa48("52") ? `` : (stryCov_9fa48("52"), `${this.left} ${this.operator} ${this.right} = ${this.answer}`);
    }
  }
}
customElements.define(stryMutAct_9fa48("53") ? "" : (stryCov_9fa48("53"), 'my-math'), MathComponent);
declare global {
  interface HTMLElementTagNameMap {
    'my-math': MathComponent;
  }
}