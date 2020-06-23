import { LogLevel, StrykerOptions } from '@stryker-mutator/api/core';
import { RunOptions } from '@stryker-mutator/api/test_runner';
import { strykerOptions } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Task } from '@stryker-mutator/util';

import ChildProcessCrashedError from '../../../src/child-proxy/ChildProcessCrashedError';
import ChildProcessProxy from '../../../src/child-proxy/ChildProcessProxy';
import { LoggingClientContext } from '../../../src/logging';
import ChildProcessTestRunnerDecorator from '../../../src/test-runner/ChildProcessTestRunnerDecorator';
import { ChildProcessTestRunnerWorker } from '../../../src/test-runner/ChildProcessTestRunnerWorker';
import TestRunnerDecorator from '../../../src/test-runner/TestRunnerDecorator';
import { Mock, mock } from '../../helpers/producers';

describe(ChildProcessTestRunnerDecorator.name, () => {
  let sut: ChildProcessTestRunnerDecorator;
  let options: StrykerOptions;
  let childProcessProxyMock: {
    proxy: Mock<TestRunnerDecorator>;
    dispose: sinon.SinonStub;
  };
  let childProcessProxyCreateStub: sinon.SinonStub;
  let loggingContext: LoggingClientContext;
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
    childProcessProxyMock = {
      dispose: sinon.stub(),
      proxy: mock(TestRunnerDecorator),
    };
    childProcessProxyCreateStub = sinon.stub(ChildProcessProxy, 'create');
    childProcessProxyCreateStub.returns(childProcessProxyMock);
    options = strykerOptions({
      plugins: ['foo-plugin', 'bar-plugin'],
    });
    loggingContext = { port: 4200, level: LogLevel.Fatal };
    sut = new ChildProcessTestRunnerDecorator(options, [], 'a working directory', loggingContext);
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

  it('should forward `run` calls', async () => {
    childProcessProxyMock.proxy.run.resolves(42);
    const runOptions: RunOptions = {
      timeout: 234,
    };
    await expect(sut.run(runOptions)).eventually.eq(42);
    expect(childProcessProxyMock.proxy.run).calledWith(runOptions);
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
