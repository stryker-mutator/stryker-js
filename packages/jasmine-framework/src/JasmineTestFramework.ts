import { TestFramework, TestSelection } from '@stryker-mutator/api/test_framework';

export default class JasmineTestFramework implements TestFramework {
  /**
   * Creates a code fragment which, if included in a test run,
   * is run before a particular test is run.
   */
  public beforeEach(codeFragment: string): string {
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
  public afterEach(codeFragment: string): string {
    return `
        jasmine.getEnv().addReporter({
          specDone: function () {
            ${codeFragment}
          }
        });`;
  }

  public filter(testSelections: TestSelection[]): string {
    if (testSelections.length) {
      const names = testSelections.map(selection => selection.name);
      return `
      jasmine.getEnv().specFilter = function (spec) {
          return ${JSON.stringify(names)}.indexOf(spec.getFullName()) !== -1;
      }`;
    } else {
      return '';
    }
  }
}
