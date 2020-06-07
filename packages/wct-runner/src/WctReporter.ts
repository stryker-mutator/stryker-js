import { EventEmitter } from 'events';

import { TestResult, TestStatus } from '@stryker-mutator/api/test_runner';
import { BrowserDef } from 'web-component-tester/runner/browserrunner';
import { CompletedState, TestEndData } from 'web-component-tester/runner/clireporter';

const TEST_START_EVENT = 'test-start';
const TEST_END_EVENT = 'test-end';

export default class WctReporter {
  public results: TestResult[] = [];
  private before = new Date();

  constructor(private readonly context: EventEmitter) {
    context.on(TEST_START_EVENT, this.testStart);
    context.on(TEST_END_EVENT, this.testEnd);
  }

  public dispose() {
    this.context.removeListener(TEST_START_EVENT, this.testStart);
    this.context.removeListener(TEST_END_EVENT, this.testEnd);
  }

  // Both testStart and testEnd are properties here, rather than methods. This is deliberate to allow for `this` pointer to work
  private readonly testStart = () => {
    this.before = new Date();
  };

  private readonly testEnd = (_browser: BrowserDef, result: TestEndData) => {
    this.results.push({
      failureMessages: this.toFailureMessages(result.error),
      name: this.testNamePartsToString(result.test),
      status: this.toTestResultStatus(result.state),
      timeSpentMs: new Date().getTime() - this.before.getTime()
    });
  };

  private toFailureMessages(error: any): string[] | undefined {
    switch (typeof error) {
      case 'undefined':
        return undefined;
      case 'string':
        return [error];
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
