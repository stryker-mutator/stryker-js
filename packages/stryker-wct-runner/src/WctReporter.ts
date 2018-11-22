import { EventEmitter } from 'events';
import { BrowserDef } from 'web-component-tester/runner/browserrunner';
import { TestEndData, CompletedState } from 'web-component-tester/runner/clireporter';
import { TestResult, TestStatus } from 'stryker-api/test_runner';


export default class WctReporter {

  public results: TestResult[] = [];
  private before = new Date();

  constructor(emitter: EventEmitter) {
    emitter.on(
      'test-start', () => {
        this.before = new Date();
      }
    );
    emitter.on(
      'test-end', (_browser: BrowserDef, result: TestEndData) => {
        this.addTestResult(result);
      });
  }

  private addTestResult(result: TestEndData) {
    this.results.push({
      name: this.testNamePartsToString(result.test),
      status: this.toTestResultStatus(result.state),
      timeSpentMs: new Date().getTime() - this.before.getTime()
    });
  }

  private testNamePartsToString(testNameParts: string[]): string {
    return testNameParts.reduce((prev, current, index) => {
      if (index === 0) {
        // First part is the file name
        return '';
      } else {
        return `${prev} ${current}`;
      }
    }, '').trim();
  }

  private toTestResultStatus(state: CompletedState): TestStatus {
    switch (state) {
      case 'failing':
        return TestStatus.Failed;
      case 'passing':
        return TestStatus.Success;
      default:
        return TestStatus.Skipped;
    }
  }
}