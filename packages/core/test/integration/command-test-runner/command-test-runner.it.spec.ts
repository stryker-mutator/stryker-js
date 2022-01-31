import { TestStatus, DryRunStatus } from '@stryker-mutator/api/test-runner';
import { factory, assertions } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';
import { CommandRunnerOptions } from '@stryker-mutator/api/core';

import { CommandTestRunner } from '../../../src/test-runner/command-test-runner.js';
import * as objectUtils from '../../../src/utils/object-utils.js';
import { resolveFromRoot } from '../../helpers/test-utils.js';

describe(`${CommandTestRunner.name} integration`, () => {
  const workingDir = resolveFromRoot('testResources', 'command-runner');

  describe(CommandTestRunner.prototype.dryRun.name, () => {
    it('should report test as successful', async () => {
      const sut = createSut();
      const result = await sut.dryRun();
      assertions.expectCompleted(result);
      expect(result.tests).lengthOf(1);
      expect(result.tests[0].status).eq(TestStatus.Success);
      expect(result.tests[0].id).eq('all');
      expect(result.tests[0].name).eq('All tests');
      expect(result.tests[0].timeSpentMs).greaterThan(1);
    });

    it('should report test as failed if exit code != 0', async () => {
      const sut = createSut({ command: 'npm run fail' });
      const result = await sut.dryRun();
      assertions.expectCompleted(result);
      expect(result.tests).lengthOf(1);
      expect(TestStatus[result.tests[0].status]).eq(TestStatus[TestStatus.Failed]);
      expect(result.tests[0].name).eq('All tests');
      assertions.expectFailed(result.tests[0]);
      expect(result.tests[0].failureMessage).includes('Test 2 - NOK');
      expect(result.tests[0].timeSpentMs).greaterThan(1);
    });

    it('should kill the child process and timeout the run result if dispose is called', async () => {
      // Arrange
      const killSpy = sinon.spy(objectUtils, 'kill');
      const sut = createSut({ command: 'npm run wait' });
      const runPromise = sut.dryRun();

      // Act
      await sut.dispose();
      const result = await runPromise;

      // Assert
      expect(result.status).eq(DryRunStatus.Timeout);
      expect(killSpy).called;
    });
  });

  describe(CommandTestRunner.prototype.mutantRun.name, () => {
    it('should report mutant as survived if the process exits with 0', async () => {
      const sut = createSut({ command: 'npm run mutant' });
      const result = await sut.mutantRun({ activeMutant: factory.mutant({ id: '41' }) });
      assertions.expectSurvived(result);
    });
    it('should report mutant as killed if the process exits with 1', async () => {
      const sut = createSut({ command: 'npm run mutant' });
      const result = await sut.mutantRun({ activeMutant: factory.mutant({ id: '42' /* 42 should fail */ }) });
      assertions.expectKilled(result);
      expect(result.killedBy).eq('all');
    });
  });

  function createSut(settings?: CommandRunnerOptions) {
    const strykerOptions = factory.strykerOptions();
    if (settings) {
      strykerOptions.commandRunner = settings;
    }
    return new CommandTestRunner(workingDir, strykerOptions);
  }
});
