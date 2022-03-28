import { URL } from 'url';

import { LogLevel } from '@stryker-mutator/api/core';
import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { CheckerChildProcessProxy } from '../../../src/checker/checker-child-process-proxy.js';
import { CheckerWorker } from '../../../src/checker/checker-worker.js';
import { ChildProcessProxy } from '../../../src/child-proxy/child-process-proxy.js';
import { LoggingClientContext } from '../../../src/logging/index.js';

describe(CheckerChildProcessProxy.name, () => {
  let childProcessProxyCreateStub: sinon.SinonStubbedMember<typeof ChildProcessProxy.create>;
  let loggingContext: LoggingClientContext;

  beforeEach(() => {
    childProcessProxyCreateStub = sinon.stub(ChildProcessProxy, 'create');
    loggingContext = { port: 4200, level: LogLevel.Fatal };
  });

  function createSut(): CheckerChildProcessProxy {
    return new CheckerChildProcessProxy(testInjector.options, ['plugin', 'paths'], loggingContext);
  }

  describe('constructor', () => {
    it('should create the child process', () => {
      createSut();
      sinon.assert.calledWithExactly(
        childProcessProxyCreateStub,
        new URL('../../../src/checker/checker-worker.js', import.meta.url).toString(),
        loggingContext,
        testInjector.options,
        ['plugin', 'paths'],
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
