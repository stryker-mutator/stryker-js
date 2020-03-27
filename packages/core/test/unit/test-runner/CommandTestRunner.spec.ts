import * as childProcess from 'child_process';
import * as os from 'os';

import { RunResult, RunStatus, TestStatus } from '@stryker-mutator/api/test_runner';
import { errorToString } from '@stryker-mutator/util';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { factory } from '@stryker-mutator/test-helpers';

import CommandTestRunner, { CommandRunnerSettings } from '../../../src/test-runner/CommandTestRunner';
import * as objectUtils from '../../../src/utils/objectUtils';
import Timer, * as timerModule from '../../../src/utils/Timer';
import ChildProcessMock from '../../helpers/ChildProcessMock';
import { Mock, mock } from '../../helpers/producers';

describe(CommandTestRunner.name, () => {
  let childProcessMock: ChildProcessMock;
  let killStub: sinon.SinonStub;
  let timerMock: Mock<Timer>;

  beforeEach(() => {
    childProcessMock = new ChildProcessMock(42);
    sinon.stub(childProcess, 'exec').returns(childProcessMock);
    killStub = sinon.stub(objectUtils, 'kill');
    timerMock = mock(Timer);
    sinon.stub(timerModule, 'default').returns(timerMock);
  });

  describe('run', () => {
    it('should run `npm test` by default', async () => {
      await actRun(createSut(undefined, 'foobarDir'));
      expect(childProcess.exec).calledWith('npm test', { cwd: 'foobarDir' });
    });

    it('should allow other commands using configuration', async () => {
      await actRun(createSut({ command: 'some other command' }));
      expect(childProcess.exec).calledWith('some other command');
    });

    it('should report successful test when the exit code = 0', async () => {
      timerMock.elapsedMs.returns(42);
      const result = await actRun();
      const expectedResult: RunResult = {
        status: RunStatus.Complete,
        tests: [{ name: 'All tests', status: TestStatus.Success, timeSpentMs: 42 }]
      };
      expect(result).deep.eq(expectedResult);
    });

    it('should report failed test when the exit code != 0', async () => {
      timerMock.elapsedMs.returns(42);
      const sut = createSut();
      const resultPromise = sut.run();
      await tick();
      childProcessMock.stdout.emit('data', 'x Test 1 failed');
      childProcessMock.stderr.emit('data', '1 != 2');
      childProcessMock.emit('exit', 1);
      const result = await resultPromise;
      const expectedResult: RunResult = {
        status: RunStatus.Complete,
        tests: [{ name: 'All tests', status: TestStatus.Failed, timeSpentMs: 42, failureMessages: [`x Test 1 failed${os.EOL}1 != 2`] }]
      };
      expect(result).deep.eq(expectedResult);
    });

    it('should report error on error and kill the process', async () => {
      killStub.resolves();
      const expectedError = new Error('foobar error');
      const sut = createSut();
      const resultPromise = sut.run();
      await tick();
      childProcessMock.emit('error', expectedError);
      const result = await resultPromise;
      const expectedResult: RunResult = {
        errorMessages: [errorToString(expectedError)],
        status: RunStatus.Error,
        tests: []
      };
      expect(result).deep.eq(expectedResult);
    });

    it('should remove all listeners on exit', async () => {
      await actRun();
      expect(childProcessMock.listenerCount('exit')).eq(0);
      expect(childProcessMock.listenerCount('error')).eq(0);
      expect(childProcessMock.stdout.listenerCount('data')).eq(0);
      expect(childProcessMock.stderr.listenerCount('data')).eq(0);
    });
  });

  describe('dispose', () => {
    it('should kill any running process', async () => {
      killStub.resolves();
      const sut = createSut();
      sut.run();
      await sut.dispose();
      expect(killStub).calledWith(childProcessMock.pid);
    });

    it('should resolve running processes in a timeout', async () => {
      const sut = createSut();
      const resultPromise = sut.run();
      await sut.dispose();
      const result = await resultPromise;
      expect(RunStatus[result.status]).eq(RunStatus[RunStatus.Timeout]);
    });

    it('should not kill anything if running process was already resolved', async () => {
      const sut = createSut();
      await actRun(sut);
      sut.dispose();
      expect(killStub).not.called;
    });
  });

  async function actRun(sut: CommandTestRunner = createSut(), exitCode = 0) {
    const resultPromise = sut.run();
    await tick();
    childProcessMock.emit('exit', exitCode);
    return resultPromise;
  }

  function createSut(settings?: CommandRunnerSettings, workingDir = 'workingDir') {
    const strykerOptions = factory.strykerOptions();
    if (settings) {
      strykerOptions.commandRunner = settings;
    }
    return new CommandTestRunner(workingDir, strykerOptions);
  }

  function tick(): Promise<void> {
    return new Promise(res => setTimeout(res, 0));
  }
});
