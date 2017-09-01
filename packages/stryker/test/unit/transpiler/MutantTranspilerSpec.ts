import { expect } from 'chai';
import MutantTranspiler from '../../../src/transpiler/MutantTranspiler';
import ChildProcessProxy from '../../../src/child-proxy/ChildProcessProxy';
import TranspilerFacade from '../../../src/transpiler/TranspilerFacade';
import { Mock, mock, transpileResult, config, textFile, webFile, testableMutant } from '../../helpers/producers';
import { TranspileResult } from 'stryker-api/transpile';

describe('MutantTranspiler', () => {
  let sut: MutantTranspiler;
  let transpilerFacadeMock: Mock<TranspilerFacade>;
  let transpileResultOne: TranspileResult;
  let transpileResultTwo: TranspileResult;

  beforeEach(() => {
    transpilerFacadeMock = mock(TranspilerFacade);
    sandbox.stub(ChildProcessProxy, 'create').returns({ proxy: transpilerFacadeMock });
    transpileResultOne = transpileResult({ error: 'first result' });
    transpileResultTwo = transpileResult({ error: 'second result' });
    transpilerFacadeMock.transpile
      .onFirstCall().resolves(transpileResultOne)
      .onSecondCall().resolves(transpileResultTwo);
  });

  describe('constructor', () => {
    it('should use the ChildProcessProxy to spawn a new MutantTranspiler in a separated process', () => {
      const expectedConfig = config({ plugins: ['plugin1'], logLevel: 'someLogLevel' });
      sut = new MutantTranspiler(expectedConfig);
      expect(ChildProcessProxy.create).calledWith(
        require.resolve('../../../src/transpiler/TranspilerFacade'),
        'someLogLevel',
        ['plugin1'],
        TranspilerFacade,
        { config: expectedConfig, keepSourceMaps: false });
    });
  });

  describe('initialize', () => {

    it('should transpile all files', () => {
      const expectedFiles = [textFile(), webFile()];
      sut = new MutantTranspiler(config());
      const actualResult = sut.initialize(expectedFiles);
      expect(transpilerFacadeMock.transpile).calledWith(expectedFiles);
      return expect(actualResult).eventually.eq(transpileResultOne);
    });

  });

  describe('transpileMutants', () => {

    beforeEach(() => {
      sut = new MutantTranspiler(config());
    });

    it('should transpile mutants', async () => {
      const mutants = [testableMutant(), testableMutant()];
      const actualResult = await sut.transpileMutants(mutants)
        .toArray()
        .toPromise();
      expect(actualResult).deep.eq([
        { mutant: mutants[0], transpileResult: transpileResultOne },
        { mutant: mutants[1], transpileResult: transpileResultTwo }
      ]);
    });

    it('should transpile mutants one by one in sequence', async () => {
      // Arrange
      let resolveFirst: (transpileResult: TranspileResult) => void = () => { };
      let resolveSecond: (transpileResult: TranspileResult) => void = () => { };
      transpilerFacadeMock.transpile.resetBehavior();
      transpilerFacadeMock.transpile
        .onFirstCall().returns(new Promise<TranspileResult>(res => resolveFirst = res))
        .onSecondCall().returns(new Promise<TranspileResult>(res => resolveSecond = res));
      const actualResults: TranspileResult[] = [];

      // Act
      sut.transpileMutants([testableMutant('one'), testableMutant('two')])
        .subscribe(transpileResult => actualResults.push(transpileResult.transpileResult));

      // Assert: only first time called
      expect(transpilerFacadeMock.transpile).calledOnce;
      expect(actualResults).lengthOf(0);
      resolveFirst(transpileResultOne);
      await nextTick();
      // Assert: second one is called, first one is received
      expect(transpilerFacadeMock.transpile).calledTwice;
      expect(actualResults).lengthOf(1);
      resolveSecond(transpileResultTwo);
      // Assert: all results are in
      await nextTick();
      expect(actualResults).deep.eq([transpileResultOne, transpileResultTwo]);
    });
    const nextTick = () => new Promise(res => {
      setTimeout(res, 0);
    });
  });
});