import { factory } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as typedInject from 'typed-inject';
import { PartialStrykerOptions, LogLevel } from '@stryker-mutator/api/core';
import { MutantResult } from '@stryker-mutator/api/report';

import { LogConfigurator } from '../../src/logging';
import Stryker from '../../src/Stryker';
import { PrepareExecutor, MutantInstrumenterExecutor, DryRunExecutor, MutationTestExecutor } from '../../src/process';
import { coreTokens } from '../../src/di';

describe(Stryker.name, () => {
  let sut: Stryker;
  let shutdownLoggingStub: sinon.SinonStub;
  let injectorMock: sinon.SinonStubbedInstance<typedInject.Injector>;
  let cliOptions: PartialStrykerOptions;
  let mutantResults: MutantResult[];

  let prepareExecutorMock: sinon.SinonStubbedInstance<PrepareExecutor>;
  let mutantInstrumenterExecutorMock: sinon.SinonStubbedInstance<MutantInstrumenterExecutor>;
  let dryRunExecutorMock: sinon.SinonStubbedInstance<DryRunExecutor>;
  let mutationTestExecutorMock: sinon.SinonStubbedInstance<MutationTestExecutor>;

  beforeEach(() => {
    injectorMock = factory.injector();
    mutantResults = [];
    prepareExecutorMock = sinon.createStubInstance(PrepareExecutor);
    mutantInstrumenterExecutorMock = sinon.createStubInstance(MutantInstrumenterExecutor);
    dryRunExecutorMock = sinon.createStubInstance(DryRunExecutor);
    mutationTestExecutorMock = sinon.createStubInstance(MutationTestExecutor);
    injectorMock.injectClass
      .withArgs(PrepareExecutor)
      .returns(prepareExecutorMock)
      .withArgs(MutantInstrumenterExecutor)
      .returns(mutantInstrumenterExecutorMock)
      .withArgs(DryRunExecutor)
      .returns(dryRunExecutorMock)
      .withArgs(MutationTestExecutor)
      .returns(mutationTestExecutorMock);

    prepareExecutorMock.execute.resolves(injectorMock);
    mutantInstrumenterExecutorMock.execute.resolves(injectorMock);
    dryRunExecutorMock.execute.resolves(injectorMock);
    mutationTestExecutorMock.execute.resolves(mutantResults);

    cliOptions = {};
    shutdownLoggingStub = sinon.stub(LogConfigurator, 'shutdown');
  });

  describe('runMutationTest()', () => {
    beforeEach(() => {
      sut = new Stryker(cliOptions, injectorMock);
    });

    it('should execute the preparations', async () => {
      await sut.runMutationTest();
      expect(prepareExecutorMock.execute).calledOnce;
    });
    it('should execute the mutant instrumenter', async () => {
      await sut.runMutationTest();
      expect(mutantInstrumenterExecutorMock.execute).calledOnce;
    });
    it('should execute the dry run', async () => {
      await sut.runMutationTest();
      expect(dryRunExecutorMock.execute).calledOnce;
    });

    it('should execute actual mutation testing', async () => {
      await sut.runMutationTest();
      expect(mutationTestExecutorMock.execute).calledOnce;
    });

    it('should provide the cli options to the prepare executor', async () => {
      cliOptions.logLevel = LogLevel.Trace;
      const expectedCliOptions = { ...cliOptions };
      await sut.runMutationTest();
      expect(injectorMock.provideValue).calledWithExactly(coreTokens.cliOptions, expectedCliOptions);
      expect(injectorMock.provideValue).calledBefore(injectorMock.injectClass);
    });

    it('should reject when prepare rejects', async () => {
      const expectedError = new Error('expected error for testing');
      prepareExecutorMock.execute.rejects(expectedError);
      await expect(sut.runMutationTest()).rejectedWith(expectedError);
    });

    it('should reject when execute the mutant instrumenter rejects', async () => {
      const expectedError = new Error('expected error for testing');
      mutationTestExecutorMock.execute.rejects(expectedError);
      await expect(sut.runMutationTest()).rejectedWith(expectedError);
    });
    it('should reject when execute the dry run rejects', async () => {
      const expectedError = new Error('expected error for testing');
      dryRunExecutorMock.execute.rejects(expectedError);
      await expect(sut.runMutationTest()).rejectedWith(expectedError);
    });
    it('should reject when execute actual mutation testing rejects', async () => {
      const expectedError = new Error('expected error for testing');
      mutationTestExecutorMock.execute.rejects(expectedError);
      await expect(sut.runMutationTest()).rejectedWith(expectedError);
    });

    it('should dispose the injector', async () => {
      await sut.runMutationTest();
      expect(injectorMock.dispose).called;
    });

    it('should shut down the logging server', async () => {
      await sut.runMutationTest();
      expect(shutdownLoggingStub).called;
    });

    it('should dispose the injector when actual mutation testing rejects', async () => {
      mutationTestExecutorMock.execute.rejects(new Error('Expected error for testing'));
      await expect(sut.runMutationTest()).rejected;
      expect(injectorMock.dispose).called;
    });
    it('should shut down the logging server when actual mutation testing rejects', async () => {
      mutationTestExecutorMock.execute.rejects(new Error('Expected error for testing'));
      await expect(sut.runMutationTest()).rejected;
      expect(shutdownLoggingStub).called;
    });
  });
});
