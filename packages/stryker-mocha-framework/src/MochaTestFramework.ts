import { TestFramework, TestSelection } from 'stryker-api/test_framework';

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

  filter(testSelections: TestSelection[]) {
    const selectedTestNames = testSelections.map(selection => selection.name);
    return `var Mocha = window.Mocha || require('mocha');
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
        if(selectedTestNames.indexOf(name) !== -1) {
          realAddTest.apply(this, arguments);
        }
      };`;
  }
}
