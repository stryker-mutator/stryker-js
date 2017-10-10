import { expect } from 'chai';
import { Config } from 'stryker-api/config';
import TranspilerFacade from '../../../src/transpiler/TranspilerFacade';
import { Transpiler, TranspilerFactory, TranspileResult, FileLocation } from 'stryker-api/transpile';
import { file, fileLocation, mock, Mock, transpileResult } from '../../helpers/producers';

describe('TranspilerFacade', () => {
  let createStub: sinon.SinonStub;
  let sut: TranspilerFacade;

  beforeEach(() => {
    createStub = sandbox.stub(TranspilerFactory.instance(), 'create');
  });

  describe('when there are no transpilers', () => {

    beforeEach(() => {
      sut = new TranspilerFacade({ config: new Config(), keepSourceMaps: true });
    });

    it('should return input when `transpile` is called', () => {
      const input = [file({ name: 'input' })];
      const result = sut.transpile(input);
      expect(createStub).not.called;
      expect(result.error).is.null;
      expect(result.outputFiles).eq(input);
    });

    it('should return input when `getMappedLocation` is called', () => {
      const input = fileLocation({ fileName: 'input' });
      const result = sut.getMappedLocation(input);
      expect(createStub).not.called;
      expect(result).eq(input);
    });
  });

  describe('with 2 transpilers', () => {

    let transpilerOne: Mock<Transpiler>;
    let transpilerTwo: Mock<Transpiler>;
    let resultOne: TranspileResult;
    let resultTwo: TranspileResult;
    let locationOne: FileLocation;
    let locationTwo: FileLocation;
    let config: Config;

    beforeEach(() => {
      config = new Config();
      config.transpilers.push('transpiler-one', 'transpiler-two');
      transpilerOne = mock(TranspilerFacade);
      transpilerTwo = mock(TranspilerFacade);
      resultOne = transpileResult({ outputFiles: [file({ name: 'result-1' })] });
      resultTwo = transpileResult({ outputFiles: [file({ name: 'result-2' })] });
      locationOne = fileLocation({ fileName: 'location-1' });
      locationTwo = fileLocation({ fileName: 'location-2' });
      createStub
        .withArgs('transpiler-one').returns(transpilerOne)
        .withArgs('transpiler-two').returns(transpilerTwo);
      transpilerOne.transpile.returns(resultOne);
      transpilerOne.getMappedLocation.returns(locationOne);
      transpilerTwo.transpile.returns(resultTwo);
      transpilerTwo.getMappedLocation.returns(locationTwo);
    });

    it('should create two transpilers', () => {
      sut = new TranspilerFacade({ config, keepSourceMaps: true });
      expect(createStub).calledTwice;
      expect(createStub).calledWith('transpiler-one');
      expect(createStub).calledWith('transpiler-two');
    });

    it('should chain the transpilers when `transpile` is called', () => {
      sut = new TranspilerFacade({ config, keepSourceMaps: true });
      const input = [file({ name: 'input' })];
      const result = sut.transpile(input);
      expect(result).eq(resultTwo);
      expect(transpilerOne.transpile).calledWith(input);
      expect(transpilerTwo.transpile).calledWith(resultOne.outputFiles);
    });

    it('should chain an additional transpiler when requested', () => {
      const additionalTranspiler = mock(TranspilerFacade);
      const expectedResult = transpileResult({ outputFiles: [file({ name: 'result-3' })] });
      additionalTranspiler.transpile.returns(expectedResult);
      const input = [file({ name: 'input' })];
      sut = new TranspilerFacade(
        { config, keepSourceMaps: true },
        { name: 'someTranspiler', transpiler: additionalTranspiler }
      );
      const output = sut.transpile(input);
      expect(output).eq(expectedResult);
      expect(additionalTranspiler.transpile).calledWith(resultTwo.outputFiles);
    });


    it('should stop chaining if an error occurs during `transpile`', () => {
      sut = new TranspilerFacade({ config, keepSourceMaps: true });
      const input = [file({ name: 'input' })];
      resultOne.error = 'an error';
      const result = sut.transpile(input);
      expect(result).eq(resultOne);
      expect(transpilerOne.transpile).calledWith(input);
      expect(transpilerTwo.transpile).not.called;
    });

    it('should chain the transpilers when `getMappedLocation` is called', () => {
      sut = new TranspilerFacade({ config, keepSourceMaps: true });
      const input = fileLocation({ fileName: 'input' });
      const result = sut.getMappedLocation(input);
      expect(result).eq(locationTwo);
      expect(transpilerOne.getMappedLocation).calledWith(input);
      expect(transpilerTwo.getMappedLocation).calledWith(locationOne);
    });
  });
});

