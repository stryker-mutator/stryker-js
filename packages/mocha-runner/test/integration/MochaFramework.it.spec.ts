import { TestSelection } from '@stryker-mutator/api/test_framework';
import { RunResult, RunStatus, TestStatus } from '@stryker-mutator/api/test_runner';
import { expect } from 'chai';
import { fork } from 'child_process';
import MochaTestFramework from 'stryker-mocha-framework/src/MochaTestFramework';
import { AUTO_START_ARGUMENT, RunMessage } from './MochaTestFrameworkIntegrationTestWorker';

const test0: Readonly<TestSelection> = Object.freeze({
  id: 0,
  name: 'MyMath should be able to add two numbers'
});
const test3: Readonly<TestSelection> = Object.freeze({
  id: 3,
  name: 'MyMath should be able to recognize a negative number'
});

export function wrapInClosure(codeFragment: string) {
  return `
    (function (window) {
      ${codeFragment}
    })((Function('return this'))());`;
}

describe('Integration with stryker-mocha-framework', () => {

  let testFramework: MochaTestFramework;

  beforeEach(() => {
    testFramework = new MochaTestFramework();
  });

  it('should be able to select only test 0 and 3 to run', async () => {
    const testHooks = wrapInClosure(testFramework.filter([test0, test3]));
    const actualProcessOutput = await actRun(testHooks);
    expect(actualProcessOutput.result.tests.map(test => ({ name: test.name, status: test.status }))).deep.eq([{
      name: 'MyMath should be able to add two numbers',
      status: TestStatus.Success
    }, {
      name: 'MyMath should be able to recognize a negative number',
      status: TestStatus.Success
    }]);
  });

  it('should be able to run beforeEach and afterEach', async () => {
    const testHooks = wrapInClosure(
      testFramework.beforeEach('console.log("beforeEach from hook");') +
      testFramework.afterEach('console.log("afterEach from hook");')
    );
    const actualProcessOutput = await actRun(testHooks);
    expect(actualProcessOutput.result.status).eq(RunStatus.Complete);
    expect(actualProcessOutput.stdout).includes('beforeEach from hook');
    expect(actualProcessOutput.stdout).includes('afterEach from hook');
  });

  function actRun(testHooks: string | undefined): Promise<{ result: RunResult, stdout: string }> {
    return new Promise<{ result: RunResult, stdout: string }>((resolve, reject) => {
      const sutProxy = fork(require.resolve('./MochaTestFrameworkIntegrationTestWorker'), [AUTO_START_ARGUMENT], {
        execArgv: [],
        silent: true
      });
      let stdout: string = '';
      sutProxy.stdout.on('data', chunk => stdout += chunk.toString());
      const message: RunMessage = { kind: 'run', testHooks };
      sutProxy.send(message, (error: Error) => {
        if (error) {
          reject(error);
          sutProxy.kill('SIGKILL');
        }
      });
      sutProxy.on('message', (result: RunResult) => {
        if (result.tests) {
          resolve({ result, stdout });
        } else {
          reject(result);
        }
        sutProxy.kill('SIGKILL');
      });
    });
  }
});
