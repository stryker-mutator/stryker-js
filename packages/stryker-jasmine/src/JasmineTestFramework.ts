import { TestFramework, TestSelection } from 'stryker-api/test_framework';

export default class JasmineTestFramework implements TestFramework {

  constructor() {
  }

  /**
   * Creates a code fragment which, if included in a test run,
   * is run before a particular test is run.
   */
  beforeEach(codeFragment: string): string {
      return `
        jasmine.getEnv().addReporter({
          specStarted: function () {
            ${codeFragment}
          }
        });`;    
  }

  /**
   * Creates a code fragment which, if included in a test run,
   * is run before a particular test is run.
   */
  afterEach(codeFragment: string): string {
      return `
        jasmine.getEnv().addReporter({
          specDone: function () {
            ${codeFragment}
          }
        });`;
  }

  filter(testSelections: TestSelection[]): string {
    const names = testSelections.map(selection => selection.name);
    return `    
      jasmine.getEnv().specFilter = function (spec) {
          return ${JSON.stringify(names)}.indexOf(spec.getFullName()) !== -1;
      }`;
  }
}