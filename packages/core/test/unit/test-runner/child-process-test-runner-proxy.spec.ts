import { URL } from 'url';

import { LogLevel, StrykerOptions } from '@stryker-mutator/api/core';
import { expect } from 'chai';
import sinon from 'sinon';
import { Task } from '@stryker-mutator/util';
import { factory, testInjector } from '@stryker-mutator/test-helpers';

import { ChildProcessCrashedError } from '../../../src/child-proxy/child-process-crashed-error.js';
import { ChildProcessProxy, Promisified } from '../../../src/child-proxy/child-process-proxy.js';
import { LoggingClientContext } from '../../../src/logging/index.js';
import { ChildProcessTestRunnerProxy } from '../../../src/test-runner/child-process-test-runner-proxy.js';
import { ChildProcessTestRunnerWorker } from '../../../src/test-runner/child-process-test-runner-worker.js';

describe(ChildProcessTestRunnerProxy.name, () => {
  let options: StrykerOptions;
  let childProcessProxyMock: sinon.SinonStubbedInstance<ChildProcessProxy<ChildProcessTestRunnerWorker>>;
  let proxyMock: sinon.SinonStubbedInstance<Promisified<ChildProcessTestRunnerWorker>>;
  let childProcessProxyCreateStub: sinon.SinonStubbedMember<typeof ChildProcessProxy.create>;
  let loggingContext: LoggingClientContext;
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    childProcessProxyMock = sinon.createStubInstance(ChildProcessProxy);
    proxyMock = (childProcessProxyMock as { proxy: Promisified<ChildProcessTestRunnerWorker> }).proxy =
      factory.testRunner() as sinon.SinonStubbedInstance<Promisified<ChildProcessTestRunnerWorker>>;

    childProcessProxyCreateStub = sinon.stub(ChildProcessProxy, 'create');
    childProcessProxyCreateStub.returns(childProcessProxyMock);
    options = factory.strykerOptions({
      plugins: ['foo-plugin', 'bar-plugin'],
    });
    loggingContext = { port: 4200, level: LogLevel.Fatal };
  });

  function createSut(): ChildProcessTestRunnerProxy {
    return new ChildProcessTestRunnerProxy(options, 'a working directory', loggingContext, ['plugin', 'paths'], testInjector.logger);
  }

  it('should create the child process proxy', () => {
    options.testRunnerNodeArgs = ['--inspect', '--no-warnings'];
    createSut();
    sinon.assert.calledWithExactly(
      childProcessProxyCreateStub,
      new URL('../../../src/test-runner/child-process-test-runner-worker.js', import.meta.url).toString(),
      loggingContext,
      options,
      ['plugin', 'paths'],
      'a working directory',
      ChildProcessTestRunnerWorker,
      ['--inspect', '--no-warnings']
    );
  });

  it('should forward `init` calls', async () => {
    const sut = createSut();
    proxyMock.init.resolves();
    await sut.init();
    expect(proxyMock.init).called;
  });

  it('should forward `dryRun` calls', async () => {
    const sut = createSut();
    const expectedResult = factory.completeDryRunResult({ mutantCoverage: factory.mutantCoverage() });
    proxyMock.dryRun.resolves(expectedResult);
    const runOptions = factory.dryRunOptions({
      timeout: 234,
    });
    const actualResult = await sut.dryRun(runOptions);
    expect(actualResult).eq(expectedResult);
    expect(proxyMock.dryRun).calledWith(runOptions);
  });

  it('should forward `mutantRun` calls', async () => {
    const sut = createSut();
    const expectedResult = factory.survivedMutantRunResult();
    proxyMock.mutantRun.resolves(expectedResult);
    const runOptions = factory.mutantRunOptions({
      timeout: 234,
    });
    const actualResult = await sut.mutantRun(runOptions);
    expect(actualResult).eq(expectedResult);
    expect(proxyMock.mutantRun).calledWith(runOptions);
  });

  describe('dispose', () => {
    it('should dispose the test runner before disposing the child process itself on `dispose`', async () => {
      const sut = createSut();
      proxyMock.dispose.resolves();
      await sut.dispose();
      expect(proxyMock.dispose).calledBefore(childProcessProxyMock.dispose);
    });

    it('should not reject when the child process is down', async () => {
      const sut = createSut();
      proxyMock.dispose.rejects(new ChildProcessCrashedError(1, '1'));
      await sut.dispose();
      expect(childProcessProxyMock.dispose).called;
      expect(testInjector.logger.warn).not.called;
    });

    it('should log, but not reject, when the child process rejects', async () => {
      const sut = createSut();
      const expectedError = new Error('Could not divide by zero 🤷‍♀️');
      proxyMock.dispose.rejects(expectedError);
      await sut.dispose();
      expect(childProcessProxyMock.dispose).called;
      expect(testInjector.logger.warn).calledWithExactly(
        'An unexpected error occurred during test runner disposal. This might be worth looking into. Stryker will ignore this error.',
        expectedError
      );
    });

    it('should only wait 2 seconds for the test runner to be disposed', async () => {
      const sut = createSut();
      const testRunnerDisposeTask = new Task();
      proxyMock.dispose.returns(testRunnerDisposeTask.promise);
      const disposePromise = sut.dispose();
      clock.tick(2001);
      await disposePromise;
      expect(childProcessProxyMock.dispose).called;
      testRunnerDisposeTask.resolve(undefined);
    });
  });
});
