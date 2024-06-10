import { factory } from '@stryker-mutator/test-helpers';
import sinon from 'sinon';
import * as typedInject from 'typed-inject';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { expect } from 'chai';

import { PrepareExecutor, MutationTestContext } from '../../../../src/process/index.js';
import { InstrumentMethod } from '../../../../src/server/methods/index.js';
import { MutantInstrumenterExecutor as ServerMutantInstrumenterExecutor } from '../../../../src/server/methods/process/mutant-instrument-executor.js';

describe(InstrumentMethod.name, () => {
  let injectorStub: sinon.SinonStubbedInstance<typedInject.Injector<MutationTestContext>>;
  let loggerMock: sinon.SinonStubbedInstance<Logger>;
  let prepareExecutorMock: sinon.SinonStubbedInstance<PrepareExecutor>;
  let mutantInstrumenterExecutorMock: sinon.SinonStubbedInstance<ServerMutantInstrumenterExecutor>;
  let getLoggerStub: sinon.SinonStub;

  beforeEach(() => {
    injectorStub = factory.injector();
    loggerMock = factory.logger();
    getLoggerStub = sinon.stub();

    prepareExecutorMock = sinon.createStubInstance(PrepareExecutor);
    mutantInstrumenterExecutorMock = sinon.createStubInstance(ServerMutantInstrumenterExecutor);

    injectorStub.injectClass
      .withArgs(PrepareExecutor)
      .returns(prepareExecutorMock)
      .withArgs(ServerMutantInstrumenterExecutor)
      .returns(mutantInstrumenterExecutorMock);

    injectorStub.resolve.withArgs(commonTokens.getLogger).returns(getLoggerStub);
    getLoggerStub.returns(loggerMock);

    prepareExecutorMock.execute.resolves(injectorStub as typedInject.Injector<MutationTestContext>);
    mutantInstrumenterExecutorMock.execute.resolves([]);
  });

  describe('runInstrumentation', () => {
    it('should run the instrumentation if no glob patterns are provided', async () => {
      const result = await InstrumentMethod.runInstrumentation({}, () => injectorStub);
      expect(result).to.deep.equal([]);
      expect(mutantInstrumenterExecutorMock.execute).calledOnce;
    });

    it('should run the instrumentation with the provided glob patterns', async () => {
      const globPatterns = ['glob/pattern'];
      await InstrumentMethod.runInstrumentation({ mutate: globPatterns }, () => injectorStub);
      expect(prepareExecutorMock.execute).calledOnceWith({ mutate: globPatterns });
    });
  });
});
