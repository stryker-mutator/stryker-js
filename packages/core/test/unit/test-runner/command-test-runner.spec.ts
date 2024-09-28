import childProcess from 'child_process';
import os from 'os';
import { syncBuiltinESMExports } from 'module';

import { DryRunResult, DryRunStatus, TestStatus } from '@stryker-mutator/api/test-runner';
import { errorToString } from '@stryker-mutator/util';
import { expect } from 'chai';
import sinon from 'sinon';
import { factory, assertions } from '@stryker-mutator/test-helpers';
import { CommandRunnerOptions } from '@stryker-mutator/api/core';

import { CommandTestRunner } from '../../../src/test-runner/command-test-runner.js';
import { objectUtils } from '../../../src/utils/object-utils.js';
import { ChildProcessMock } from '../../helpers/child-process-mock.js';

describe(CommandTestRunner.name, () => {
  let childProcessMock: ChildProcessMock;
  let killStub: sinon.SinonStub;
  let clock: sinon.SinonFakeTimers;
  let execMock: sinon.SinonStubbedMember<typeof childProcess.exec>;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    childProcessMock = new ChildProcessMock(42);
    execMock = sinon.stub(childProcess, 'exec').returns(childProcessMock as childProcess.ChildProcess);
    killStub = sinon.stub(objectUtils, 'kill');
    syncBuiltinESMExports();
  });

  describe(CommandTestRunner.prototype.dryRun.name, () => {
    it('should run `npm test` by default', async () => {
      await actDryRun(createSut(undefined, 'foobarDir'));
      expect(execMock).calledWith('npm test', { cwd: 'foobarDir', env: process.env });
    });

    it('should allow other commands using configuration', async () => {
      await actDryRun(createSut({ command: 'some other command' }));
      expect(execMock).calledWith('some other command');
    });

    it('should report successful test when the exit code = 0', async () => {
      const result = await actDryRun(undefined, 0, 42);
      const expectedResult: DryRunResult = {
        status: DryRunStatus.Complete,
        tests: [{ id: 'all', name: 'All tests', status: TestStatus.Success, timeSpentMs: 42 }],
      };
      expect(result).deep.eq(expectedResult);
    });

    it('should report failed test when the exit code != 0', async () => {
      const sut = createSut();
      const resultPromise = sut.dryRun();
      childProcessMock.stdout.emit('data', 'x Test 1 failed');
      childProcessMock.stderr.emit('data', '1 != 2');
      childProcessMock.emit('exit', 1);
      const result = await resultPromise;
      const expectedResult: DryRunResult = {
        status: DryRunStatus.Complete,
        tests: [{ id: 'all', name: 'All tests', status: TestStatus.Failed, timeSpentMs: 0, failureMessage: `x Test 1 failed${os.EOL}1 != 2` }],
      };
      expect(result).deep.eq(expectedResult);
    });

    it('should report error on error and kill the process', async () => {
      killStub.resolves();
      const expectedError = new Error('foobar error');
      const sut = createSut();
      const resultPromise = sut.dryRun();
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
  });

  describe(CommandTestRunner.prototype.mutantRun.name, () => {
    it('should run with __ACTIVE_MUTANT__ environment variable active', async () => {
      const sut = createSut(undefined, 'foobarDir');
      await actMutantRun(sut, { activeMutantId: '0' });
      expect(execMock).calledWith('npm test', { cwd: 'foobarDir', env: { ...process.env, __STRYKER_ACTIVE_MUTANT__: '0' } });
    });

    it('should convert exit code 0 to a survived mutant', async () => {
      const result = await actMutantRun(createSut(), { exitCode: 0 });
      assertions.expectSurvived(result);
    });

    it('should convert exit code 1 to a killed mutant', async () => {
      const result = await actMutantRun(createSut(), { exitCode: 1 });
      assertions.expectKilled(result);
      expect(result.killedBy).deep.eq(['all']);
    });
  });

  describe('dispose', () => {
    it('should kill any running process', async () => {
      killStub.resolves();
      const sut = createSut();
      void sut.dryRun();
      await sut.dispose();
      expect(killStub).calledWith(childProcessMock.pid);
    });

    it('should resolve running processes in a timeout', async () => {
      const sut = createSut();
      const resultPromise = sut.dryRun();
      await sut.dispose();
      const result = await resultPromise;
      expect(result.status).eq(DryRunStatus.Timeout);
    });

    it('should not kill anything if running process was already resolved', async () => {
      const sut = createSut();
      await actDryRun(sut);
      await sut.dispose();
      expect(killStub).not.called;
    });
  });

  function actDryRun(sut: CommandTestRunner = createSut(), exitCode = 0, elapsedTimeMS = 0) {
    const resultPromise = sut.dryRun();
    clock.tick(elapsedTimeMS);
    actTestProcessEnds(exitCode);
    return resultPromise;
  }

  function actMutantRun(sut: CommandTestRunner = createSut(), { exitCode = 0, activeMutantId = '0' }) {
    const resultPromise = sut.mutantRun({ activeMutant: factory.mutant({ id: activeMutantId }) });
    actTestProcessEnds(exitCode);
    return resultPromise;
  }

  function createSut(settings?: CommandRunnerOptions, workingDir = 'workingDir') {
    const strykerOptions = factory.strykerOptions();
    if (settings) {
      strykerOptions.commandRunner = settings;
    }
    return new CommandTestRunner(workingDir, strykerOptions);
  }

  function actTestProcessEnds(exitCode: number) {
    childProcessMock.emit('exit', exitCode);
  }
});
