import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import TranspilerFacade from '../../../src/transpiler/TranspilerFacade';
import { Transpiler, TranspilerFactory, TranspileResult } from 'stryker-api/transpile';
import { file, mock, Mock, transpileResult } from '../../helpers/producers';

describe('TranspilerFacade', () => {
  let createStub: sinon.SinonStub;
  let sut: TranspilerFacade;

  beforeEach(() => {
    createStub = sandbox.stub(TranspilerFactory.instance(), 'create');
  });

  describe('when there are no transpilers', () => {

    beforeEach(() => {
      sut = new TranspilerFacade({ config: new Config(), produceSourceMaps: true });
    });

    it('should return input when `transpile` is called', async () => {
      const input = [file({ name: 'input' })];
      const result = await sut.transpile(input);
      expect(createStub).not.called;
      expect(result.error).is.null;
      expect(result.outputFiles).eq(input);
    });
  });

  describe('with 2 transpilers', () => {

    let transpilerOne: Mock<Transpiler>;
    let transpilerTwo: Mock<Transpiler>;
    let resultOne: TranspileResult;
    let resultTwo: TranspileResult;
    let config: Config;

    beforeEach(() => {
      config = new Config();
      config.transpilers.push('transpiler-one', 'transpiler-two');
      transpilerOne = mock(TranspilerFacade);
      transpilerTwo = mock(TranspilerFacade);
      resultOne = transpileResult({ outputFiles: [file({ name: 'result-1' })] });
      resultTwo = transpileResult({ outputFiles: [file({ name: 'result-2' })] });
      createStub
        .withArgs('transpiler-one').returns(transpilerOne)
        .withArgs('transpiler-two').returns(transpilerTwo);
      transpilerOne.transpile.returns(resultOne);
      transpilerTwo.transpile.returns(resultTwo);
    });

    it('should create two transpilers', () => {
      sut = new TranspilerFacade({ config, produceSourceMaps: true });
      expect(createStub).calledTwice;
      expect(createStub).calledWith('transpiler-one');
      expect(createStub).calledWith('transpiler-two');
    });

    it('should chain the transpilers when `transpile` is called', async () => {
      sut = new TranspilerFacade({ config, produceSourceMaps: true });
      const input = [file({ name: 'input' })];
      const result = await sut.transpile(input);
      expect(result).eq(resultTwo);
      expect(transpilerOne.transpile).calledWith(input);
      expect(transpilerTwo.transpile).calledWith(resultOne.outputFiles);
    });

    it('should chain an additional transpiler when requested', async () => {
      const additionalTranspiler = mock(TranspilerFacade);
      const expectedResult = transpileResult({ outputFiles: [file({ name: 'result-3' })] });
      additionalTranspiler.transpile.returns(expectedResult);
      const input = [file({ name: 'input' })];
      sut = new TranspilerFacade(
        { config, produceSourceMaps: true },
        { name: 'someTranspiler', transpiler: additionalTranspiler }
      );
      const output = await sut.transpile(input);
      expect(output).eq(expectedResult);
      expect(additionalTranspiler.transpile).calledWith(resultTwo.outputFiles);
    });


    it('should stop chaining if an error occurs during `transpile`', async () => {
      sut = new TranspilerFacade({ config, produceSourceMaps: true });
      const input = [file({ name: 'input' })];
      resultOne.error = 'an error';
      const result = await sut.transpile(input);
      expect(result).eq(resultOne);
      expect(transpilerOne.transpile).calledWith(input);
      expect(transpilerTwo.transpile).not.called;
    });

  });
});

