import * as path from 'path';
import * as child_process from 'child_process';
import * as _ from 'lodash';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { RunOptions, RunResult, RunStatus } from 'stryker-api/test_runner';
import IsolatedTestRunnerAdapter from '../../../src/isolated-runner/IsolatedTestRunnerAdapter';
import IsolatedRunnerOptions from '../../../src/isolated-runner/IsolatedRunnerOptions';
import { WorkerMessage, AdapterMessage, RunMessage, ResultMessage } from '../../../src/isolated-runner/MessageProtocol';
import { serialize } from '../../../src/utils/objectUtils';

describe('IsolatedTestRunnerAdapter', () => {
  let sut: IsolatedTestRunnerAdapter;
  let sinonSandbox: sinon.SinonSandbox;
  let clock: sinon.SinonFakeTimers;
  let fakeChildProcess: any;
  let runnerOptions: IsolatedRunnerOptions;

  beforeEach(() => {
    runnerOptions = {
      port: 42,
      files: [],
      sandboxWorkingFolder: 'a working directory',
      strykerOptions: null
    };
    sinonSandbox = sinon.sandbox.create();
    fakeChildProcess = {
      kill: sinon.spy(),
      send: sinon.spy(),
      on: sinon.spy()
    };
    sinonSandbox.stub(child_process, 'fork', () => fakeChildProcess);
    clock = sinon.useFakeTimers();
  });

  describe('when constructed', () => {

    beforeEach(() => {
      sut = new IsolatedTestRunnerAdapter('realRunner', runnerOptions);
    });

    it('should spawn a child process', () => {
      let expectedWorkerProcessPath = path.resolve(__dirname + '/../../../src/isolated-runner/') + '/IsolatedTestRunnerAdapterWorker';
      let expectedExecArgv = _.clone(process.execArgv);
      _.remove(expectedExecArgv, arg => arg.substr(0, 11) === '--debug-brk');
      expect(child_process.fork).to.have.been.calledWith(expectedWorkerProcessPath, [], { execArgv: expectedExecArgv, silent: true });
      expect(fakeChildProcess.on).to.have.been.calledWith('message');
    });

    describe('init', () => {

      let initPromise: Promise<void>;
      beforeEach(() => {
        initPromise = sut.init();
        clock.tick(500);
        receiveResultMessage();
      });

      it('should call "init" on child process', () => {
        const expectedMessage: AdapterMessage = { kind: 'init' };
        expect(fakeChildProcess.send).to.have.been.calledWith(serialize(expectedMessage));
      });


      it('should resolve the promise when the process responds with "initDone"', () => {
        receiveMessage({ kind: 'initDone' });
        return expect(initPromise).to.eventually.eq(null);
      });
    });

    describe('run(options)', () => {
      let runOptions: RunOptions;
      let runPromise: Promise<RunResult>;

      beforeEach(() => {
        runOptions = { timeout: 2000 };
        runPromise = sut.run(runOptions);
      });

      it('should send run-message to worker', () => {
        const expectedMessage: RunMessage = {
          kind: 'run',
          runOptions
        };
        expect(fakeChildProcess.send).to.have.been.calledWith(serialize(expectedMessage));
      });

      it('should proxy run response', () => {
        const expectedResult: RunResult = {
          status: RunStatus.Error,
          errorMessages: ['OK, only used for unit testing'],
          tests: []
        };
        receiveMessage({ kind: 'result', result: expectedResult });
        expect(runPromise).to.eventually.be.eq(expectedResult);
      });
    });

    describe('dispose()', () => {
      let disposePromise: Promise<void>;

      beforeEach(() => {
        disposePromise = sut.dispose();
      });

      it('should send `dispose` to worker process',
        () => expect(fakeChildProcess.send).to.have.been.calledWith(serialize({ kind: 'dispose' })));

      describe('and child process responses to dispose', () => {
        beforeEach(() => {
          receiveMessage({ kind: 'disposeDone' });
          return disposePromise;
        });

        it('should kill the child process', () =>
          expect(fakeChildProcess.kill).to.have.been.calledWith());
      });

      describe('and a timeout occurred', () => {

        beforeEach(() => {
          // Wait for worker process takes 2000 ms
          clock.tick(2000);
          return disposePromise;
        });

        it('should kill the child process', () =>
          expect(fakeChildProcess.kill).to.have.been.calledWith('SIGKILL'));
      });
    });
  });

  const receiveResultMessage = () => {
    const message: ResultMessage = { kind: 'result', result: { status: RunStatus.Complete, tests: [] } };
    receiveMessage(message);
    return message;
  };

  const receiveMessage = (message: WorkerMessage) => {
    const callback: (message: WorkerMessage) => void = fakeChildProcess.on.getCall(0).args[1];
    callback(message);
    return message;
  };

  afterEach(() => {
    clock.restore();
    sinonSandbox.restore();
  });
});