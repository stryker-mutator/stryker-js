import {
  DryRunStatus,
  TimeoutDryRunResult,
  TestRunner,
  MutantRunStatus,
  TimeoutMutantRunResult,
  DryRunResult,
  MutantRunResult,
} from '@stryker-mutator/api/test-runner';
import { expect } from 'chai';
import sinon from 'sinon';

import { factory } from '@stryker-mutator/test-helpers';

import { TimeoutDecorator } from '../../../src/test-runner/timeout-decorator.js';

describe(TimeoutDecorator.name, () => {
  let sut: TimeoutDecorator;
  let sandbox: sinon.SinonSandbox;
  let clock: sinon.SinonFakeTimers;
  let testRunner1: sinon.SinonStubbedInstance<Required<TestRunner>>;
  let testRunner2: sinon.SinonStubbedInstance<Required<TestRunner>>;
  let availableTestRunners: Array<sinon.SinonStubbedInstance<Required<TestRunner>>>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    clock = sinon.useFakeTimers();
    testRunner1 = factory.testRunner();
    testRunner2 = factory.testRunner();
    availableTestRunners = [testRunner1, testRunner2];
    sut = new TimeoutDecorator(() => availableTestRunners.shift() ?? expect.fail('test runners are empty'));
  });

  afterEach(() => sandbox.restore());

  function itShouldProxyRequests<T>(action: () => Promise<T>, methodName: 'dryRun' | 'mutantRun') {
    it('should proxy the request', () => {
      testRunner1[methodName].resolves();
      const promise = action();
      expect(testRunner1[methodName]).to.have.been.called;
      expect(promise?.then, `timeoutDecorator.${methodName} did not provide a promise`).ok;
    });

    it('should resolve when inner promise resolves', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      testRunner1[methodName].resolves('str' as any);
      const promise = action();
      return expect(promise).to.eventually.eq('str');
    });

    it('should reject when inner promise rejects', () => {
      testRunner1[methodName].rejects(new Error('some error'));
      const promise = action();
      return expect(promise).to.be.rejectedWith('some error');
    });
  }

  describe('dryRun', () => {
    itShouldProxyRequests(() => sut.dryRun(factory.dryRunOptions({ coverageAnalysis: 'all', timeout: 20 })), 'dryRun');

    it('should not handle timeouts premature', () => {
      let resolve: (result: DryRunResult) => void = () => {};
      const expectedResult = factory.completeDryRunResult();
      testRunner1.dryRun.returns(new Promise<DryRunResult>((res) => (resolve = res)));
      const runPromise = sut.dryRun(factory.dryRunOptions({ timeout: 20 }));
      clock.tick(19);
      resolve(expectedResult);
      return expect(runPromise).to.eventually.be.eq(expectedResult);
    });

    it('should handle timeouts', async () => {
      testRunner1.dryRun.returns(new Promise<DryRunResult>(() => {}));
      const runPromise = sut.dryRun(factory.dryRunOptions({ timeout: 20 }));
      clock.tick(20);
      const result = await runPromise;
      const expectedTimeoutResult: TimeoutDryRunResult = { status: DryRunStatus.Timeout };
      expect(result).deep.eq(expectedTimeoutResult);
      expect(availableTestRunners).to.have.lengthOf(0);
      expect(testRunner1.dispose).to.have.been.called;
      expect(testRunner2.init).to.have.been.called;
    });
  });

  describe('mutantRun', () => {
    itShouldProxyRequests(() => sut.mutantRun(factory.mutantRunOptions({ timeout: 20 })), 'mutantRun');

    it('should not handle timeouts premature', () => {
      let resolve: (result: MutantRunResult) => void = () => {};
      const expectedResult = factory.killedMutantRunResult();
      testRunner1.mutantRun.returns(new Promise<MutantRunResult>((res) => (resolve = res)));
      const runPromise = sut.mutantRun(factory.mutantRunOptions({ timeout: 20 }));
      clock.tick(19);
      resolve(expectedResult);
      return expect(runPromise).to.eventually.be.eq(expectedResult);
    });

    it('should handle timeouts', async () => {
      testRunner1.mutantRun.returns(new Promise<MutantRunResult>(() => {}));
      const runPromise = sut.mutantRun(factory.mutantRunOptions({ timeout: 20 }));
      clock.tick(20);
      const result = await runPromise;
      const expectedTimeoutResult: TimeoutMutantRunResult = { status: MutantRunStatus.Timeout };
      expect(result).deep.eq(expectedTimeoutResult);
      expect(availableTestRunners).to.have.lengthOf(0);
      expect(testRunner1.dispose).to.have.been.called;
      expect(testRunner2.init).to.have.been.called;
    });
  });
});
