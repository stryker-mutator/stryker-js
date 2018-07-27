import * as path from 'path';
import { expect } from 'chai';
import CommandTestRunner, { CommandRunnerSettings } from '../../../src/test-runner/CommandTestRunner';
import { Config } from 'stryker-api/config';
import { RunStatus, TestStatus } from 'stryker-api/test_runner';

describe(`${CommandTestRunner.name} integration`, function () {

  this.timeout(15000);
  const workingDir = path.resolve(__dirname, '..', '..', '..', 'testResources', 'command-runner');

  it('should report test as successful', async () => {
    const sut = createSut();
    const result = await sut.run();
    expect(RunStatus[result.status]).eq(RunStatus[RunStatus.Complete]);
    expect(result.tests).lengthOf(1);
    expect(TestStatus[result.tests[0].status]).eq(TestStatus[TestStatus.Success]);
    expect(result.tests[0].name).eq('All tests');
    expect(result.tests[0].timeSpentMs).greaterThan(1);
  });

  it('should report test as failed', async () => {
    const sut = createSut({ command: 'npm run fail' });
    const result = await sut.run();
    expect(RunStatus[result.status]).eq(RunStatus[RunStatus.Complete]);
    expect(result.tests).lengthOf(1);
    expect(TestStatus[result.tests[0].status]).eq(TestStatus[TestStatus.Failed]);
    expect(result.tests[0].name).eq('All tests');
    expect(result.tests[0].failureMessages).lengthOf(1);
    expect((result.tests[0].failureMessages as string[])[0]).includes('Test 2 - NOK');
    expect(result.tests[0].timeSpentMs).greaterThan(1);
  });

  function createSut(settings?: CommandRunnerSettings) {
    const strykerOptions = new Config();
    if (settings) {
      strykerOptions.set({
        commandRunner: settings
      });
    }
    return new CommandTestRunner(workingDir, { strykerOptions, port: 23, fileNames: [] });
  }
});