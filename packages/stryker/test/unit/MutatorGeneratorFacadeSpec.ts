import { expect } from 'chai';
import { MutantGenerator, MutantGeneratorFactory } from 'stryker-api/mutant';
import MutantGeneratorFacade from '../../src/MutantGeneratorFacade';
import { Config } from 'stryker-api/config';
import { Mock, file } from '../helpers/producers';

describe('MutantGeneratorFacade', () => {

  let mutantGeneratorMock: Mock<MutantGenerator>;

  beforeEach(() => {
    mutantGeneratorMock = {
      generateMutants: sandbox.stub()
    };
    mutantGeneratorMock.generateMutants.returns(['mutant']);
    sandbox.stub(MutantGeneratorFactory.instance(), 'create').returns(mutantGeneratorMock);
  });

  describe('generateMutants', () => {
    it('should create the configured mutant generator', () => {
      const config = new Config();
      const sut = new MutantGeneratorFacade(config);
      const inputFiles = [file()];
      expect(sut.generateMutants(inputFiles)).deep.eq(['mutant']);
      expect(mutantGeneratorMock.generateMutants).calledWith(inputFiles);
      expect(MutantGeneratorFactory.instance().create).calledWith('es5');
    });
  });
});