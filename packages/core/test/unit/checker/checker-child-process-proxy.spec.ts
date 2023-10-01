import { URL } from 'url';

import { FileDescriptions, LogLevel } from '@stryker-mutator/api/core';
import { testInjector } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';

import { CheckerChildProcessProxy } from '../../../src/checker/checker-child-process-proxy.js';
import { CheckerWorker } from '../../../src/checker/checker-worker.js';
import { ChildProcessProxy } from '../../../src/child-proxy/child-process-proxy.js';
import { LoggingClientContext } from '../../../src/logging/index.js';
import { IdGenerator } from '../../../src/child-proxy/id-generator.js';

describe(CheckerChildProcessProxy.name, () => {
  let childProcessProxyCreateStub: sinon.SinonStubbedMember<typeof ChildProcessProxy.create>;
  let loggingContext: LoggingClientContext;
  let fileDescriptions: FileDescriptions;
  let idGeneratorStub: sinon.SinonStubbedInstance<IdGenerator>;

  beforeEach(() => {
    childProcessProxyCreateStub = sinon.stub(ChildProcessProxy, 'create');
    loggingContext = { port: 4200, level: LogLevel.Fatal };
    fileDescriptions = { 'foo.js': { mutate: true } };
    idGeneratorStub = sinon.createStubInstance(IdGenerator);
  });

  function createSut(): CheckerChildProcessProxy {
    return new CheckerChildProcessProxy(testInjector.options, fileDescriptions, ['plugin', 'paths'], loggingContext, idGeneratorStub);
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
        [],
        idGeneratorStub,
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
        ['foo', 'bar'],
        idGeneratorStub,
      );
    });
  });
});
