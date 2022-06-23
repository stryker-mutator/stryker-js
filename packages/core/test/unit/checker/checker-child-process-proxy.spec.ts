import { URL } from 'url';

import { FileDescriptions, LogLevel } from '@stryker-mutator/api/core';
import { testInjector } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';

import { CheckerChildProcessProxy } from '../../../src/checker/checker-child-process-proxy.js';
import { CheckerWorker } from '../../../src/checker/checker-worker.js';
import { ChildProcessProxy } from '../../../src/child-proxy/child-process-proxy.js';
import { LoggingClientContext } from '../../../src/logging/index.js';

describe(CheckerChildProcessProxy.name, () => {
  let childProcessProxyCreateStub: sinon.SinonStubbedMember<typeof ChildProcessProxy.create>;
  let loggingContext: LoggingClientContext;
  let fileDescriptions: FileDescriptions;

  beforeEach(() => {
    childProcessProxyCreateStub = sinon.stub(ChildProcessProxy, 'create');
    loggingContext = { port: 4200, level: LogLevel.Fatal };
    fileDescriptions = { 'foo.js': { mutate: true } };
  });

  function createSut(): CheckerChildProcessProxy {
    return new CheckerChildProcessProxy(testInjector.options, fileDescriptions, ['plugin', 'paths'], loggingContext);
  }

  describe('constructor', () => {
    it('should create the child process', () => {
      createSut();
      sinon.assert.calledWithExactly(
        childProcessProxyCreateStub,
        new URL('../../../src/checker/checker-worker.js', import.meta.url).toString(),
        loggingContext,
        testInjector.options,
        fileDescriptions,
        ['plugin', 'paths'],
        process.cwd(),
        CheckerWorker,
        []
      );
    });
    it('should provide arguments', () => {
      testInjector.options.checkerNodeArgs = ['foo', 'bar'];
      createSut();
      sinon.assert.calledOnceWithExactly(
        childProcessProxyCreateStub,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        sinon.match.any,
        ['foo', 'bar']
      );
    });
  });
});
