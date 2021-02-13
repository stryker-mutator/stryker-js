import childProcess from 'child_process';
import os from 'os';

import { CommandRunnerOptions } from '@stryker-mutator/api/core';
import { DryRunResult, DryRunStatus, TestStatus } from '@stryker-mutator/api/test-runner';
import { assertions, factory } from '@stryker-mutator/test-helpers';
import { errorToString, StrykerError } from '@stryker-mutator/util';
import { expect } from 'chai';
import sinon from 'sinon';

import { CommandTestRunner } from '../../../src/test-runner/command-test-runner';
import * as objectUtils from '../../../src/utils/object-utils';
import * as timerModule from '../../../src/utils/timer';
import { ChildProcessMock } from '../../helpers/child-process-mock';
import { Mock, mock } from '../../helpers/producers';

describe(CommandTestRunner.name, () => {
  let childProcessMock: ChildProcessMock;
  let killStub: sinon.SinonStub;
  let timerMock: Mock<timerModule.Timer>;

  beforeEach(() => {
    childProcessMock = new ChildProcessMock(42);
    sinon.stub(childProcess, 'exec').returns(childProcessMock as childProcess.ChildProcess);
    killStub = sinon.stub(objectUtils, 'kill');
    timerMock = mock(timerModule.Timer);
    sinon.stub(timerModule, 'Timer').returns(timerMock);
  });

  describe(CommandTestRunner.prototype.dryRun.name, () => {
    it('should run `npm test` by default', async () => {
      await actDryRun(createSut(undefined, 'foobarDir'));
      expect(childProcess.exec).calledWith('npm test', { cwd: 'foobarDir', env: process.env });
    });

    it('should allow other commands using configuration', async () => {
      await actDryRun(createSut({ command: 'some other command' }));
      expect(childProcess.exec).calledWith('some other command');
    });

    it('should report successful test when the exit code = 0', async () => {
      timerMock.elapsedMs.returns(42);
      const result = await actDryRun();
      const expectedResult: DryRunResult = {
        status: DryRunStatus.Complete,
        tests: [{ id: 'all', name: 'All tests', status: TestStatus.Success, timeSpentMs: 42 }],
      };
      expect(result).deep.eq(expectedResult);
    });

    it('should report failed test when the exit code != 0', async () => {
      timerMock.elapsedMs.returns(42);
      const sut = createSut();
      const resultPromise = sut.dryRun({ coverageAnalysis: 'off' });
      await tick();
      childProcessMock.stdout.emit('data', 'x Test 1 failed');
      childProcessMock.stderr.emit('data', '1 != 2');
      childProcessMock.emit('exit', 1);
      const result = await resultPromise;
      const expectedResult: DryRunResult = {
        status: DryRunStatus.Complete,
        tests: [{ id: 'all', name: 'All tests', status: TestStatus.Failed, timeSpentMs: 42, failureMessage: `x Test 1 failed${os.EOL}1 != 2` }],
      };
      expect(result).deep.eq(expectedResult);
    });

    it('should report error on error and kill the process', async () => {
      killStub.resolves();
      const expectedError = new Error('foobar error');
      const sut = createSut();
      const resultPromise = sut.dryRun({ coverageAnalysis: 'off' });
      await tick();
      childProcessMock.emit('error', expectedError);
      const result = await resultPromise;
      const expectedResult: DryRunResult = {
        errorMessage: errorToString(expectedError),
        status: DryRunStatus.Error,
      };
      expect(result).deep.eq(expectedResult);
    });

    it('should remove all listeners on exit', async () => {
      await actDryRun();
      expect(childProcessMock.listenerCount('exit')).eq(0);
      expect(childProcessMock.listenerCount('error')).eq(0);
      expect(childProcessMock.stdout.listenerCount('data')).eq(0);
      expect(childProcessMock.stderr.listenerCount('data')).eq(0);
    });

    it('should reject if coverageAnalysis !== "off"', async () => {
      const sut = createSut();
      await expect(sut.dryRun({ coverageAnalysis: 'all' })).rejectedWith(
        StrykerError,
        'The "command" test runner does not support coverageAnalysis "all".'
      );
    });
  });

  describe(CommandTestRunner.prototype.mutantRun.name, () => {
    it('should run with __ACTIVE_MUTANT__ environment variable active', async () => {
      const sut = createSut(undefined, 'foobarDir');
      await actMutantRun(sut, { activeMutantId: 0 });
      expect(childProcess.exec).calledWith('npm test', { cwd: 'foobarDir', env: { ...process.env, __STRYKER_ACTIVE_MUTANT__: '0' } });
    });

    it('should convert exit code 0 to a survived mutant', async () => {
      const result = await actMutantRun(createSut(), { exitCode: 0 });
      assertions.expectSurvived(result);
    });

    it('should convert exit code 1 to a killed mutant', async () => {
      const result = await actMutantRun(createSut(), { exitCode: 1 });
      assertions.expectKilled(result);
      expect(result.killedBy).eq('all');
    });
  });

  describe('dispose', () => {
    it('should kill any running process', async () => {
      killStub.resolves();
      const sut = createSut();
      sut.dryRun({ coverageAnalysis: 'off' });
      await sut.dispose();
      expect(killStub).calledWith(childProcessMock.pid);
    });

    it('should resolve running processes in a timeout', async () => {
      const sut = createSut();
      const resultPromise = sut.dryRun({ coverageAnalysis: 'off' });
      await sut.dispose();
      const result = await resultPromise;
      expect(result.status).eq(DryRunStatus.Timeout);
    });

    it('should not kill anything if running process was already resolved', async () => {
      const sut = createSut();
      await actDryRun(sut);
      sut.dispose();
      expect(killStub).not.called;
    });
  });

  async function actDryRun(sut: CommandTestRunner = createSut(), exitCode = 0) {
    const resultPromise = sut.dryRun({ coverageAnalysis: 'off' });
    await actTestProcessEnds(exitCode);
    return resultPromise;
  }

  async function actMutantRun(sut: CommandTestRunner = createSut(), { exitCode = 0, activeMutantId = 0 }) {
    const resultPromise = sut.mutantRun({ activeMutant: factory.mutant({ id: activeMutantId }) });
    await actTestProcessEnds(exitCode);
    return resultPromise;
  }

  function createSut(settings?: CommandRunnerOptions, workingDir = 'workingDir') {
    const strykerOptions = factory.strykerOptions();
    if (settings) {
      strykerOptions.commandRunner = settings;
    }
    return new CommandTestRunner(workingDir, strykerOptions);
  }

  function tick(): Promise<void> {
    return new Promise((res) => setTimeout(res, 0));
  }
  async function actTestProcessEnds(exitCode: number) {
    await tick();
    childProcessMock.emit('exit', exitCode);
  }
});
