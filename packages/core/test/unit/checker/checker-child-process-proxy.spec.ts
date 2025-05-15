import { URL } from 'url';

import { FileDescriptions } from '@stryker-mutator/api/core';
import { testInjector } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';

import { CheckerChildProcessProxy } from '../../../src/checker/checker-child-process-proxy.js';
import { CheckerWorker } from '../../../src/checker/checker-worker.js';
import { ChildProcessProxy } from '../../../src/child-proxy/child-process-proxy.js';
import type { LoggingServerAddress } from '../../../src/logging/index.js';
import { IdGenerator } from '../../../src/child-proxy/id-generator.js';

describe(CheckerChildProcessProxy.name, () => {
  let childProcessProxyCreateStub: sinon.SinonStubbedMember<
    typeof ChildProcessProxy.create
  >;
  let loggingServerAddress: LoggingServerAddress;
  let fileDescriptions: FileDescriptions;
  let idGeneratorStub: sinon.SinonStubbedInstance<IdGenerator>;

  beforeEach(() => {
    childProcessProxyCreateStub = sinon.stub(ChildProcessProxy, 'create');
    loggingServerAddress = { port: 4200 };
    fileDescriptions = { 'foo.js': { mutate: true } };
    idGeneratorStub = sinon.createStubInstance(IdGenerator);
  });

  function createSut(): CheckerChildProcessProxy {
    return new CheckerChildProcessProxy(
      testInjector.options,
      fileDescriptions,
      ['plugin', 'paths'],
      loggingServerAddress,
      testInjector.getLogger,
      idGeneratorStub,
    );
  }

  describe('constructor', () => {
    it('should create the child process', () => {
      createSut();
      sinon.assert.calledWithExactly(
        childProcessProxyCreateStub,
        new URL(
          '../../../src/checker/checker-worker.js',
          import.meta.url,
        ).toString(),
        loggingServerAddress,
        testInjector.options,
        fileDescriptions,
        ['plugin', 'paths'],
        process.cwd(),
        CheckerWorker,
        [],
        testInjector.getLogger,
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
        testInjector.getLogger,
        idGeneratorStub,
      );
    });
  });
});
