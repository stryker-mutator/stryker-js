import * as path from 'path';

import { RunStatus, TestStatus } from '@stryker-mutator/api/test_runner';
import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { CommandRunnerOptions } from '@stryker-mutator/api/core';

import CommandTestRunner from '../../../src/test-runner/CommandTestRunner';
import * as objectUtils from '../../../src/utils/objectUtils';

describe(`${CommandTestRunner.name} integration`, () => {
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

  it('should report test as failed if exit code != 0', async () => {
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

  it('should kill the child process and timeout the run result if dispose is called', async () => {
    // Arrange
    const killSpy = sinon.spy(objectUtils, 'kill');
    const sut = createSut({ command: 'npm run wait' });
    const runPromise = sut.run();

    // Act
    await sut.dispose();
    const result = await runPromise;

    // Assert
    expect(RunStatus[result.status]).eq(RunStatus[RunStatus.Timeout]);
    expect(killSpy).called;
  });

  function createSut(settings?: CommandRunnerOptions) {
    const strykerOptions = factory.strykerOptions();
    if (settings) {
      strykerOptions.commandRunner = settings;
    }
    return new CommandTestRunner(workingDir, strykerOptions);
  }
});
