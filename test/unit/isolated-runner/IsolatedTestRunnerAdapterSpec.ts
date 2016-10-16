import * as child_process from 'child_process';
import * as sinon from 'sinon';
import { RunnerOptions, RunOptions, RunResult, RunState } from 'stryker-api/test_runner';
import IsolatedTestRunnerAdapter from '../../../src/isolated-runner/IsolatedTestRunnerAdapter';
import { WorkerMessage, AdapterMessage, RunMessage, ResultMessage } from '../../../src/isolated-runner/MessageProtocol';
import { serialize } from '../../../src/utils/objectUtils';
import { expect } from 'chai';
import * as path from 'path';
import * as _ from 'lodash';

describe('IsolatedTestRunnerAdapter', () => {
  let sut: IsolatedTestRunnerAdapter;
  let sinonSandbox: sinon.SinonSandbox;
  let clock: sinon.SinonFakeTimers;
  let fakeChildProcess: any;
  let runnerOptions: RunnerOptions;

  beforeEach(() => {
    runnerOptions = {
      port: 42,
      files: [],
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

    describe('and "run" is called with 2000ms timeout', () => {
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

      describe('and a timeout occurred', () => {

        beforeEach(() => {
          clock.tick(2100);
        });

        it('should send `dispose` to worker process', () => expect(fakeChildProcess.send).to.have.been.calledWith(serialize({ kind: 'dispose' })));

        let actAssertTimeout = () => {
          it('should kill the child process and start a new one', () => {
            expect(fakeChildProcess.kill).to.have.been.calledWith();
            expect(child_process.fork).to.have.been.called.callCount(2);
          });

          describe('and to init', () => {
            let actualRunResult: RunResult;
            beforeEach(() => {
              receiveMessage({ kind: 'initDone' });
            });

            it('should result in a `timeout` after the restart', () => expect(runPromise).to.eventually.satisfy((result: RunResult) => result.state === RunState.Timeout));
          });
        };

        describe('and child process responses to dispose', () => {
          beforeEach(() => {
            receiveMessage({ kind: 'disposeDone' });
            return sut.dispose(); // should return newly created promise
          });

          actAssertTimeout();
        });

        describe('and child process is unresponsive', () => {
          beforeEach(() => {
            clock.tick(2100); // default wait for child process is 2000
            return sut.dispose(); // should return newly created promise
          });

          actAssertTimeout();
        });

      });

      describe('and a result message occurred after 1900 ms', () => {

        let expectedMessage: ResultMessage;
        beforeEach(() => {
          clock.tick(1900);
          expectedMessage = receiveResultMessage();
        });

        it('should pass along the result', () => expect(runPromise).to.eventually.eq(expectedMessage.result));

        describe('when we run a second time, wait 500ms and then receive the second result', () => {

          let secondResultPromise: Promise<RunResult>;
          beforeEach(() => {
            secondResultPromise = sut.run({ timeout: 2000 });
            clock.tick(500);
            receiveResultMessage();
          });

          it('should not have resolved in a timeout', () => {
            return expect(secondResultPromise).to.eventually.satisfy((runResult: RunResult) => runResult.state !== RunState.Timeout);
          });
        });
      });
    });
  });

  let receiveResultMessage = () => {
    let message: ResultMessage = { kind: 'result', result: { state: RunState.Complete, tests: [] } };
    receiveMessage(message);
    return message;
  };

  let receiveMessage = (message: WorkerMessage) => {
    let callback: (message: WorkerMessage) => void = fakeChildProcess.on.getCall(0).args[1];
    callback(message);
    return message;
  };

  afterEach(() => {
    clock.restore();
    sinonSandbox.restore();
  });
});