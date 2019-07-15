import { EventEmitter } from 'events';
import { BrowserDef } from 'web-component-tester/runner/browserrunner';
import { TestEndData, CompletedState } from 'web-component-tester/runner/clireporter';
import { TestResult, TestStatus } from '@stryker-mutator/api/test_runner';

const testStartEvent = 'test-start';
const testEndEvent = 'test-end';

export default class WctReporter {
  public results: TestResult[] = [];
  private before = new Date();

  constructor(private readonly context: EventEmitter) {
    context.on(testStartEvent, this.testStart);
    context.on(testEndEvent, this.testEnd);
  }

  public dispose() {
    this.context.removeListener(testStartEvent, this.testStart);
    this.context.removeListener(testEndEvent, this.testEnd);
  }

  // Both testStart and testEnd are properties here, rather than methods. This is deliberate to allow for `this` pointer to work
  private readonly testStart = () => {
    this.before = new Date();
  }

  private readonly testEnd = (_browser: BrowserDef, result: TestEndData) => {
    this.results.push({
      failureMessages: this.toFailureMessages(result.error),
      name: this.testNamePartsToString(result.test),
      status: this.toTestResultStatus(result.state),
      timeSpentMs: new Date().getTime() - this.before.getTime(),
    });
  }

  private toFailureMessages(error: any): string[] | undefined {
    switch (typeof error) {
      case 'undefined': return undefined;
      case 'string': return [error];
      case 'object':
        if (error) {
          if (error.stack) {
            return [error.stack];
          } else {
            return [JSON.stringify(error)];
          }
        } else {
          return undefined;
        }
      default:
        return [error.toString()];
    }
  }

  private testNamePartsToString(testNameParts: string[]): string {
    // First part is the file name
    return testNameParts.splice(1).join(' ').trim();
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
