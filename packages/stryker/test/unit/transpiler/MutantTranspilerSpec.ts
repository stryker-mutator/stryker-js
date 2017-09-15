import { expect } from 'chai';
import MutantTranspiler from '../../../src/transpiler/MutantTranspiler';
import ChildProcessProxy from '../../../src/child-proxy/ChildProcessProxy';
import TranspilerFacade, * as transpilerFacade from '../../../src/transpiler/TranspilerFacade';
import { Mock, mock, transpileResult, config, textFile, webFile, testableMutant } from '../../helpers/producers';
import { TranspileResult } from 'stryker-api/transpile';
import '../../helpers/globals';

describe('MutantTranspiler', () => {
  let sut: MutantTranspiler;
  let transpilerFacadeMock: Mock<TranspilerFacade>;
  let transpileResultOne: TranspileResult;
  let transpileResultTwo: TranspileResult;
  let childProcessProxyMock: { proxy: Mock<TranspilerFacade>, dispose: sinon.SinonStub };

  beforeEach(() => {
    transpilerFacadeMock = mock(TranspilerFacade);
    childProcessProxyMock = { proxy: transpilerFacadeMock, dispose: sandbox.stub() };
    sandbox.stub(ChildProcessProxy, 'create').returns(childProcessProxyMock);
    sandbox.stub(transpilerFacade, 'default').returns(transpilerFacadeMock);
    transpileResultOne = transpileResult({ error: 'first result' });
    transpileResultTwo = transpileResult({ error: 'second result' });
    transpilerFacadeMock.transpile
      .onFirstCall().resolves(transpileResultOne)
      .onSecondCall().resolves(transpileResultTwo);
  });

  describe('with a transpiler', () => {

    it('should construct use the ChildProcessProxy to spawn a new MutantTranspiler in a separated process', () => {
      const expectedConfig = config({ transpilers: ['transpiler'], plugins: ['plugin1'], logLevel: 'someLogLevel' });
      sut = new MutantTranspiler(expectedConfig);
      expect(ChildProcessProxy.create).calledWith(
        require.resolve('../../../src/transpiler/TranspilerFacade'),
        'someLogLevel',
        ['plugin1'],
        TranspilerFacade,
        { config: expectedConfig, keepSourceMaps: false });
    });

    describe('initialize', () => {

      it('should transpile all files', () => {
        const expectedFiles = [textFile(), webFile()];
        sut = new MutantTranspiler(config({ transpilers: ['transpiler'] }));
        const actualResult = sut.initialize(expectedFiles);
        expect(transpilerFacadeMock.transpile).calledWith(expectedFiles);
        return expect(actualResult).eventually.eq(transpileResultOne);
      });
    });

    describe('dispose', () => {
      it('should dispose the child process', () => {
        sut = new MutantTranspiler(config({ transpilers: ['transpiler'] }));
        sut.dispose();
        expect(childProcessProxyMock.dispose).called;
      });
    });

    describe('transpileMutants', () => {

      beforeEach(() => {
        sut = new MutantTranspiler(config({ transpilers: ['transpiler'] }));
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

  describe('without a transpiler', () => {

    beforeEach(() => {
      sut = new MutantTranspiler(config());

    });

    it('should construct without a child process', () => {
      expect(ChildProcessProxy.create).not.called;
    });

    it('should transpile the files when initialized', async () => {
      const expectedFiles = [textFile(), webFile()];
      const actualFiles = await sut.initialize(expectedFiles);
      expect(transpilerFacadeMock.transpile).calledWith(expectedFiles);
      expect(actualFiles).eq(transpileResultOne);
      expect(actualFiles.error).eq('first result');
    });

    it('should transpile the mutated files when transpileMutants is called', async () => {
      const actualMutants = [testableMutant('file1.ts'), testableMutant('file2.ts')];
      const actualResult = await sut.transpileMutants(actualMutants).toArray().toPromise();
      expect(actualResult).lengthOf(2);
      expect(actualResult[0].transpileResult).eq(transpileResultOne);
      expect(actualResult[0].mutant).eq(actualMutants[0]);
      expect(actualResult[1].transpileResult).eq(transpileResultTwo);
      expect(actualResult[1].mutant).eq(actualMutants[1]);
    });

    it('should not dispose anything when `dispose` is called', () => {
      sut.dispose();
      expect(childProcessProxyMock.dispose).not.called;
    });
  });

});