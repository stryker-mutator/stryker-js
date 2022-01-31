import { LogLevel } from '@stryker-mutator/api/core';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { CheckerChildProcessProxy } from '../../../src/checker/checker-child-process-proxy.js';
import { CheckerWorker } from '../../../src/checker/checker-worker.js';
import { ChildProcessProxy } from '../../../src/child-proxy/child-process-proxy.js';
import { LoggingClientContext } from '../../../src/logging/index.js';

describe(CheckerChildProcessProxy.name, () => {
  let childProcessProxyCreateStub: sinon.SinonStub;
  let loggingContext: LoggingClientContext;

  beforeEach(() => {
    childProcessProxyCreateStub = sinon.stub(ChildProcessProxy, 'create');
    loggingContext = { port: 4200, level: LogLevel.Fatal };
  });

  function createSut(): CheckerChildProcessProxy {
    return new CheckerChildProcessProxy(testInjector.options, loggingContext);
  }

  describe('constructor', () => {
    it('should create the child process', () => {
      createSut();
      expect(childProcessProxyCreateStub).calledWith(
        require.resolve('../../../src/checker/checker-worker'),
        loggingContext,
        testInjector.options,
        {},
        process.cwd(),
        CheckerWorker,
        []
      );
    });
    it('should provide arguments', () => {
      testInjector.options.checkerNodeArgs = ['foo', 'bar'];
      createSut();
      expect(childProcessProxyCreateStub).calledWith(
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
