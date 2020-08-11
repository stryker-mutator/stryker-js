import { LogLevel, StrykerOptions } from '@stryker-mutator/api/core';
import { strykerOptions } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Task } from '@stryker-mutator/util';

import { TestRunner2 } from '@stryker-mutator/api/test_runner2';

import { factory } from '@stryker-mutator/test-helpers';

import ChildProcessCrashedError from '../../../src/child-proxy/ChildProcessCrashedError';
import ChildProcessProxy from '../../../src/child-proxy/ChildProcessProxy';
import { LoggingClientContext } from '../../../src/logging';
import ChildProcessTestRunnerDecorator from '../../../src/test-runner/ChildProcessTestRunnerDecorator';
import { ChildProcessTestRunnerWorker } from '../../../src/test-runner/ChildProcessTestRunnerWorker';

describe(ChildProcessTestRunnerDecorator.name, () => {
  let sut: ChildProcessTestRunnerDecorator;
  let options: StrykerOptions;
  let childProcessProxyMock: {
    proxy: sinon.SinonStubbedInstance<Required<TestRunner2>>;
    dispose: sinon.SinonStub;
  };
  let childProcessProxyCreateStub: sinon.SinonStub;
  let loggingContext: LoggingClientContext;
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    childProcessProxyMock = {
      dispose: sinon.stub(),
      proxy: factory.testRunner(),
    };
    childProcessProxyCreateStub = sinon.stub(ChildProcessProxy, 'create');
    childProcessProxyCreateStub.returns(childProcessProxyMock);
    options = strykerOptions({
      plugins: ['foo-plugin', 'bar-plugin'],
    });
    loggingContext = { port: 4200, level: LogLevel.Fatal };
    sut = new ChildProcessTestRunnerDecorator(options, 'a working directory', loggingContext);
  });

  it('should create the child process proxy', () => {
    expect(childProcessProxyCreateStub).calledWith(
      require.resolve('../../../src/test-runner/ChildProcessTestRunnerWorker.js'),
      loggingContext,
      options,
      { sandboxFileNames: [] },
      'a working directory',
      ChildProcessTestRunnerWorker
    );
  });

  it('should forward `init` calls', () => {
    childProcessProxyMock.proxy.init.resolves(42);
    return expect(sut.init()).eventually.eq(42);
  });

  it('should forward `dryRun` calls', async () => {
    const expectedResult = factory.completeDryRunResult({ mutantCoverage: factory.mutantCoverage() });
    childProcessProxyMock.proxy.dryRun.resolves(expectedResult);
    const runOptions = factory.dryRunOptions({
      timeout: 234,
    });
    const actualResult = await sut.dryRun(runOptions);
    expect(actualResult).eq(expectedResult);
    expect(childProcessProxyMock.proxy.dryRun).calledWith(runOptions);
  });

  it('should forward `mutantRun` calls', async () => {
    const expectedResult = factory.survivedMutantRunResult();
    childProcessProxyMock.proxy.mutantRun.resolves(expectedResult);
    const runOptions = factory.mutantRunOptions({
      timeout: 234,
    });
    const actualResult = await sut.mutantRun(runOptions);
    expect(actualResult).eq(expectedResult);
    expect(childProcessProxyMock.proxy.mutantRun).calledWith(runOptions);
  });

  describe('dispose', () => {
    it('should dispose the test runner before disposing the child process itself on `dispose`', async () => {
      childProcessProxyMock.proxy.dispose.resolves();
      await sut.dispose();
      expect(childProcessProxyMock.proxy.dispose).calledBefore(childProcessProxyMock.dispose);
    });

    it('should not reject when the child process is down', async () => {
      childProcessProxyMock.proxy.dispose.rejects(new ChildProcessCrashedError(1, '1'));
      await sut.dispose();
      expect(childProcessProxyMock.dispose).called;
    });

    it('should only wait 2 seconds for the test runner to be disposed', async () => {
      const testRunnerDisposeTask = new Task();
      childProcessProxyMock.proxy.dispose.returns(testRunnerDisposeTask.promise);
      const disposePromise = sut.dispose();
      clock.tick(2001);
      await disposePromise;
      expect(childProcessProxyMock.dispose).called;
      testRunnerDisposeTask.resolve(undefined);
    });
  });
});
