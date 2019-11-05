import { Mutator } from '@stryker-mutator/api/mutant';
import { PluginKind } from '@stryker-mutator/api/plugin';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { file } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { coreTokens, PluginCreator } from '../../../src/di';
import { MutatorFacade } from '../../../src/mutants/MutatorFacade';
import { Mock } from '../../helpers/producers';

describe('MutatorFacade', () => {
  let mutatorMock: Mock<Mutator>;
  let pluginCreatorMock: Mock<PluginCreator<PluginKind.Mutator>>;

  beforeEach(() => {
    mutatorMock = {
      mutate: sinon.stub()
    };
    pluginCreatorMock = sinon.createStubInstance(PluginCreator);
    pluginCreatorMock.create.returns(mutatorMock);
  });

  describe('mutate', () => {
    it('should create the configured Mutator', () => {
      testInjector.mutatorDescriptor.name = 'fooMutator';
      const mutants = [factory.mutant()];
      mutatorMock.mutate.returns(mutants);
      const sut = createSut();
      const inputFiles = [file()];
      expect(sut.mutate(inputFiles)).eq(mutants);
      expect(mutatorMock.mutate).calledWith(inputFiles);
      expect(pluginCreatorMock.create).calledWith('fooMutator');
    });

    it('should log the number of mutants generated', async () => {
      mutatorMock.mutate.returns([factory.mutant(), factory.mutant(), factory.mutant()]);
      createSut().mutate([]);
      expect(testInjector.logger.info).to.have.been.calledWith('3 Mutant(s) generated');
    });

    it('should log the number of mutants generated and excluded', async () => {
      mutatorMock.mutate.returns([
        factory.mutant({ mutatorName: 'foo' }),
        factory.mutant({ mutatorName: 'bar' }),
        factory.mutant({ mutatorName: 'baz' })
      ]);
      testInjector.mutatorDescriptor.excludedMutations = ['foo'];
      createSut().mutate([]);
      expect(testInjector.logger.info).calledWith('2 Mutant(s) generated (1 Mutant(s) excluded)');
    });

    it('should log the absence of mutants and the excluded number when all mutants are excluded', async () => {
      mutatorMock.mutate.returns([
        factory.mutant({ mutatorName: 'foo' }),
        factory.mutant({ mutatorName: 'bar' }),
        factory.mutant({ mutatorName: 'baz' })
      ]);
      testInjector.mutatorDescriptor.excludedMutations = ['foo', 'bar', 'baz'];
      testInjector.mutatorDescriptor.name = 'javascript';
      createSut().mutate([]);
      expect(testInjector.logger.info).calledWith("It's a mutant-free world, nothing to test. (3 Mutant(s) excluded)");
    });

    it('should log the absence of mutants if no mutants were generated', async () => {
      mutatorMock.mutate.returns([]);
      createSut().mutate([]);
      expect(testInjector.logger.info).calledWith("It's a mutant-free world, nothing to test.");
    });
  });

  function createSut() {
    return testInjector.injector
      .provideValue(coreTokens.pluginCreatorMutator, (pluginCreatorMock as unknown) as PluginCreator<PluginKind.Mutator>)
      .injectClass(MutatorFacade);
  }
});
