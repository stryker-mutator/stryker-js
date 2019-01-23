import { expect } from 'chai';
import { Mutator, MutatorFactory } from 'stryker-api/mutant';
import MutatorFacade from '../../src/MutatorFacade';
import { Config } from 'stryker-api/config';
import { Mock, file } from '../helpers/producers';
import * as sinon from 'sinon';

describe('MutatorFacade', () => {

  let mutatorMock: Mock<Mutator>;

  beforeEach(() => {
    mutatorMock = {
      mutate: sinon.stub()
    };
    mutatorMock.mutate.returns(['mutant']);
    sinon.stub(MutatorFactory.instance(), 'create').returns(mutatorMock);
  });

  describe('mutate', () => {
    it('should create the configured mutant generator with a string mutator', () => {
      const config = new Config();
      const sut = new MutatorFacade(config);
      const inputFiles = [file()];
      expect(sut.mutate(inputFiles)).deep.eq(['mutant']);
      expect(mutatorMock.mutate).calledWith(inputFiles);
      expect(MutatorFactory.instance().create).calledWith('es5');
    });

    it('should create the configured mutant generator with an object mutator', () => {
      const config = new Config();
      config.mutator = {
        excludedMutations: [],
        name: 'javascript'
      };
      const sut = new MutatorFacade(config);
      const inputFiles = [file()];
      expect(sut.mutate(inputFiles)).deep.eq(['mutant']);
      expect(mutatorMock.mutate).calledWith(inputFiles);
      expect(MutatorFactory.instance().create).calledWith('javascript');
    });
  });
});
