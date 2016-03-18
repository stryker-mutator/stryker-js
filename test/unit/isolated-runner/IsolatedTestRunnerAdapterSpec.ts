import * as child_process from 'child_process';
import * as sinon from 'sinon';
import {RunnerOptions, RunOptions, RunResult, TestResult} from '../../../src/api/test_runner';
import IsolatedTestRunnerAdapter from '../../../src/isolated-runner/IsolatedTestRunnerAdapter';
import Message, {MessageType} from '../../../src/isolated-runner/Message';
import ResultMessageBody from '../../../src/isolated-runner/ResultMessageBody';
import RunMessageBody from '../../../src/isolated-runner/RunMessageBody';
import StartMessageBody from '../../../src/isolated-runner/StartMessageBody';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import * as path from 'path';

let expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('IsolatedTestRunnerAdapter', () => {
  let sut: IsolatedTestRunnerAdapter;
  let sinonSandbox: Sinon.SinonSandbox;
  let clock: Sinon.SinonFakeTimers;
  let fakeChildProcess: any;
  let runnerOptions: RunnerOptions;

  beforeEach(() => {
    runnerOptions = {
      port: 42,
      sourceFiles: [],
      additionalFiles: [],
      strykerOptions: null
    };
    sinonSandbox = sinon.sandbox.create();
    fakeChildProcess = {
      kill: sinon.spy(),
      send: sinon.spy(),
      on: sinon.spy()
    }
    sinonSandbox.stub(child_process, 'fork', () => fakeChildProcess);
    clock = sinon.useFakeTimers();
  });

  describe('when constructed', () => {

    beforeEach(() => {
      sut = new IsolatedTestRunnerAdapter('realRunner', runnerOptions);
    });

    it('should spawn a child process', () => {
      let expectedWorkerProcessPath = path.resolve(__dirname + '/../../../src/isolated-runner/') + '/IsolatedTestRunnerAdapterWorker';
      expect(child_process.fork).to.have.been.calledWith(expectedWorkerProcessPath, [], {  execArgv: [], silent: true });
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
        let expectedMessage: Message<RunMessageBody> = {
          type: MessageType.Run,
          body: { runOptions }
        }
        expect(fakeChildProcess.send).to.have.been.calledWith(expectedMessage)
      });

      describe('and a timeout occurred', () => {
        beforeEach(() => {
          clock.tick(2100);
        });

        it('should resolve the promise in a Timeout', () => {
          return expect(runPromise).to.eventually.satisfy((result: RunResult) => result.result === TestResult.Timeout);
        });

        it('should kill the child process and start a new one', () => {
          expect(fakeChildProcess.kill).to.have.been.calledWith();
          expect(child_process.fork).to.have.been.called.callCount(2);
        });
      });

      describe('and a result message occurred after 1900 ms', () => {
        
        function receiveResultMessage(){
          let callback: (message: Message<ResultMessageBody>) => void = fakeChildProcess.on.getCall(0).args[1];
          let message = { type: MessageType.Result, body: { result: { result: TestResult.Complete } } };
          callback(message);
          return message;
        }
        
        let expectedMessage: Message<ResultMessageBody>;
        beforeEach(() => {
          clock.tick(1900);
          expectedMessage = receiveResultMessage();
        });

        it('should pass along the result', () => {
          return expect(runPromise).to.eventually.eq(expectedMessage.body.result);
        });

        describe('when we run a second time, wait 500ms and then receive the second result', () => {

          let secondResultPromise: Promise<RunResult>;
          beforeEach(() => {
            secondResultPromise = sut.run({ timeout: 2000 });
            clock.tick(500);
            receiveResultMessage();
          });

          it('should not have resolved in a timeout', () => {
            return expect(secondResultPromise).to.eventually.satisfy((runResult: RunResult) => runResult.result !== TestResult.Timeout);
          });
        });
      });
    });
  });

  afterEach(() => {
    clock.restore();
    sinonSandbox.restore();
  });
});