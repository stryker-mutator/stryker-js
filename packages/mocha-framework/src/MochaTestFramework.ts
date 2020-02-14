import { TestFramework, TestSelection } from '@stryker-mutator/api/test_framework';

const FILTER_HEADER_FRAGMENT = `
  var Mocha = window.Mocha || require('mocha');
  var describe = Mocha.describe;`;
const FILTER_RESET = `${FILTER_HEADER_FRAGMENT}
  if (window.____mochaAddTest) {
    Mocha.Suite.prototype.addTest = window.____mochaAddTest;
  }
`;

export default class MochaTestFramework implements TestFramework {
  public beforeEach(codeFragment: string): string {
    return `beforeEach(function() {
      ${codeFragment}
    });`;
  }

  public afterEach(codeFragment: string): string {
    return `afterEach(function() {
      ${codeFragment}
    });`;
  }

  public filter(testSelections: TestSelection[]) {
    if (testSelections.length) {
      const selectedTestNames = testSelections.map(selection => selection.name);
      return `${FILTER_HEADER_FRAGMENT}
      var selectedTestNames = ${JSON.stringify(selectedTestNames)};
      if (window.____mochaAddTest) {
        Mocha.Suite.prototype.addTest = window.____mochaAddTest;
      } else {
        window.____mochaAddTest = Mocha.Suite.prototype.addTest
      }
      var realAddTest = Mocha.Suite.prototype.addTest;

      Mocha.Suite.prototype.addTest = function (test) {
        // Only actually add the tests with the expected names
        var name = this.fullTitle() + ' ' + test.title;
        if(!selectedTestNames.length || selectedTestNames.indexOf(name) !== -1) {
          realAddTest.apply(this, arguments);
        }
      };`;
    } else {
      return FILTER_RESET;
    }
  }
}
