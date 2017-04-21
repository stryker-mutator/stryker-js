import { TestFramework } from 'stryker-api/test_framework';

export default class MochaTestFramework implements TestFramework {

  beforeEach(codeFragment: string): string {
    return `beforeEach(function() {
      ${codeFragment}
    });`;
  }

  afterEach(codeFragment: string): string {
    return `afterEach(function() {
      ${codeFragment}
    });`;
  }

  filter(testIds: number[]) {
    return `
      var mocha = window.mocha || require('mocha');
      if (window.____mochaAddTest) {
        mocha.Suite.prototype.addTest = window.____mochaAddTest;
      } else {
        window.____mochaAddTest = mocha.Suite.prototype.addTest
      }
      var current = 0;
      var realAddTest = mocha.Suite.prototype.addTest;
      mocha.Suite.prototype.addTest = function () {
        if (${JSON.stringify(testIds)}.indexOf(current) > -1) {
          realAddTest.apply(this, arguments);
        }
        current++;
      };
    `;
  }
}
