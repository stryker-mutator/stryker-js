import { EmptyAdapterMessage } from './../../../src/isolated-runner/MessageProtocol';
import * as path from 'path';
import * as child_process from 'child_process';
import * as _ from 'lodash';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { RunResult, RunStatus } from 'stryker-api/test_runner';
import IsolatedTestRunnerAdapter from '../../../src/isolated-runner/IsolatedTestRunnerAdapter';
import IsolatedRunnerOptions from '../../../src/isolated-runner/IsolatedRunnerOptions';
import { WorkerMessage, RunMessage, ResultMessage } from '../../../src/isolated-runner/MessageProtocol';
import * as objectUtils from '../../../src/utils/objectUtils';


describe('IsolatedTestRunnerAdapter', () => {
  let sut: IsolatedTestRunnerAdapter;
  let sinonSandbox: sinon.SinonSandbox;
  let clock: sinon.SinonFakeTimers;
  let killStub: sinon.SinonStub;
  let fakeChildProcess: {
    kill: sinon.SinonStub;
    send: sinon.SinonStub;
    on: sinon.SinonStub;
    pid: number;
  };
  let runnerOptions: IsolatedRunnerOptions;

  beforeEach(() => {
    runnerOptions = {
      fileNames: [],
      port: 42,
      sandboxWorkingFolder: 'a working directory',
      strykerOptions: {}
    };
    sinonSandbox = sinon.createSandbox();
    fakeChildProcess = {
      kill: sinon.stub(),
      send: sinon.stub(),
      on: sinon.stub(),
      pid: 42
    };
    killStub = sinonSandbox.stub(objectUtils, 'kill');
    sinonSandbox.stub(child_process, 'fork').returns(fakeChildProcess);
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

      function arrangeAct() {
        initPromise = sut.init();
        clock.tick(500);
        receiveResultMessage();
      }

      it('should call "init" on child process', () => {
        arrangeAct();
        const expectedMessage: EmptyAdapterMessage = { kind: 'init' };
        expect(fakeChildProcess.send).to.have.been.calledWith(objectUtils.serialize(expectedMessage));
      });


      it(' "initDone"', () => {
        arrangeAct();
        receiveMessage({ kind: 'initDone', errorMessage: null });
        return expect(initPromise).to.eventually.eq(undefined);
      });

      it('should reject any exceptions', () => {
        fakeChildProcess.send.throws(new Error('some error'));
        arrangeAct();
        return expect(initPromise).to.be.rejectedWith('some error');
      });
    });

    describe('run(options)', () => {
      const runOptions: { timeout: 2000 } = { timeout: 2000 };
      let runPromise: Promise<RunResult>;

      function act() {
        runPromise = sut.run(runOptions);
      }

      it('should send run-message to worker', () => {
        act();
        const expectedMessage: RunMessage = {
          kind: 'run',
          runOptions
        };
        expect(fakeChildProcess.send).to.have.been.calledWith(objectUtils.serialize(expectedMessage));
      });

      it('should proxy run response', () => {
        const expectedResult: RunResult = {
          status: RunStatus.Error,
          errorMessages: ['OK, only used for unit testing'],
          tests: []
        };
        act();
        receiveMessage({ kind: 'result', result: expectedResult });
        expect(runPromise).to.eventually.be.eq(expectedResult);
      });

      it('should reject any exceptions', () => {
        fakeChildProcess.send.throws(new Error('some error'));
        act();
        return expect(runPromise).to.be.rejectedWith('some error');
      });
    });

    describe('dispose()', () => {

      it('should send `dispose` to worker process', () => {
        sut.dispose();
        return expect(fakeChildProcess.send).to.have.been.calledWith(objectUtils.serialize({ kind: 'dispose' }));
      });

      describe('and child process responds to dispose', () => {
        beforeEach(() => {
          const promise = sut.dispose();
          receiveMessage({ kind: 'disposeDone' });
          return promise;
        });

        it('should kill the child process', () => {
          expect(killStub).to.have.been.calledWith(42);
        });
      });

      describe('and a timeout occurred', () => {

        beforeEach(() => {
          // Wait for worker process takes 2000 ms
          const promise = sut.dispose();
          clock.tick(2000);
          return promise;
        });

        it('should kill the child process', () => {
          expect(killStub).to.have.been.calledWith(42);
        });
      });
    });
    it('should reject any exceptions', () => {
      fakeChildProcess.send.throws(new Error('some error'));
      return expect(sut.run({ timeout: 24 })).to.be.rejectedWith('some error');
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