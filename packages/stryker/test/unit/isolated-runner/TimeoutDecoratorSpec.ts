import * as sinon from 'sinon';
import { expect } from 'chai';
import { RunStatus } from 'stryker-api/test_runner';
import TimeoutDecorator from '../../../src/isolated-runner/TimeoutDecorator';
import { isPromise } from '../../../src/utils/objectUtils';
import TestRunnerMock from '../../helpers/TestRunnerMock';

describe('TimeoutDecorator', () => {
  let sut: TimeoutDecorator;
  let sandbox: sinon.SinonSandbox;
  let clock: sinon.SinonFakeTimers;
  let testRunner1: TestRunnerMock;
  let testRunner2: TestRunnerMock;
  let availableTestRunners: TestRunnerMock[];

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    clock = sandbox.useFakeTimers();
    testRunner1 = new TestRunnerMock();
    testRunner2 = new TestRunnerMock();
    availableTestRunners = [testRunner1, testRunner2];
    sut = new TimeoutDecorator(() => {
      return <any>availableTestRunners.shift();
    });
  });

  afterEach(() => sandbox.restore());

  function itShouldProxyRequests<T>(action: () => Promise<T>, methodName: 'init' | 'dispose' | 'run') {

    it('should proxy the request', () => {
      testRunner1[methodName].resolves('str');
      const promise = action();
      expect(testRunner1[methodName]).to.have.been.called;
      expect(isPromise(promise), `timeoutDecorator.${methodName} did not provide a promise`).to.be.true;
    });

    it('should resolve when inner promise resolves', () => {
      testRunner1[methodName].resolves('str');
      const promise = action();
      return expect(promise).to.eventually.eq('str');
    });

    it('should reject when inner promise rejects', () => {
      testRunner1[methodName].rejects(new Error('some error'));
      const promise = action();
      return expect(promise).to.be.rejectedWith('some error');
    });
  }

  function itShouldProxyRequestsForMethod(methodName: 'init' | 'dispose') {
    itShouldProxyRequests(() => sut[methodName](), methodName);
  }

  describe('init', () => {
    itShouldProxyRequestsForMethod('init');
  });

  describe('dispose', () => {
    itShouldProxyRequestsForMethod('dispose');

    it('should wait no longer then 2500 ms', () => {
      testRunner1.dispose.returns(new Promise(res => { }));
      const disposePromise = sut.dispose();
      clock.tick(2500);
      const p = expect(disposePromise).to.eventually.be.eq(undefined);
      return p;
    });
  });

  describe('run', () => {
    itShouldProxyRequests(() => sut.run({ timeout: 20 }), 'run');

    it('should not handle timeouts premature', () => {
      let resolve: (result: string) => void = () => { };
      testRunner1.run.returns(new Promise<string>(res => resolve = res));
      const runPromise = sut.run({ timeout: 20 });
      clock.tick(19);
      resolve('expectedResult');
      return expect(runPromise).to.eventually.be.eq('expectedResult');
    });

    it('should handle timeouts', () => {
      testRunner1.run.returns(new Promise<string>(res => { }));
      const runPromise = sut.run({ timeout: 20 });
      clock.tick(20);
      return expect(runPromise.then(result => {
        expect(availableTestRunners).to.have.lengthOf(0);
        expect(testRunner1.dispose).to.have.been.called;
        expect(testRunner2.init).to.have.been.called;
        return result;
      })).to.eventually.be.deep.equal({ status: RunStatus.Timeout, tests: [] });
    });
  });
});