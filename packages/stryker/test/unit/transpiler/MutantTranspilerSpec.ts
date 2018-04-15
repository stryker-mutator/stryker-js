import { expect } from 'chai';
import MutantTranspiler from '../../../src/transpiler/MutantTranspiler';
import ChildProcessProxy from '../../../src/child-proxy/ChildProcessProxy';
import TranspilerFacade, * as transpilerFacade from '../../../src/transpiler/TranspilerFacade';
import { Mock, mock, config, testableMutant, file } from '../../helpers/producers';
import '../../helpers/globals';
import TranspiledMutant from '../../../src/TranspiledMutant';
import TranspileResult from '../../../src/transpiler/TranspileResult';
import { File } from 'stryker-api/core';
import { errorToString } from '../../../src/utils/objectUtils';

describe('MutantTranspiler', () => {
  let sut: MutantTranspiler;
  let transpilerFacadeMock: Mock<TranspilerFacade>;
  let transpiledFilesOne: File[];
  let transpiledFilesTwo: File[];
  let childProcessProxyMock: { proxy: Mock<TranspilerFacade>, dispose: sinon.SinonStub };

  beforeEach(() => {
    transpilerFacadeMock = mock(TranspilerFacade);
    childProcessProxyMock = { proxy: transpilerFacadeMock, dispose: sandbox.stub() };
    sandbox.stub(ChildProcessProxy, 'create').returns(childProcessProxyMock);
    sandbox.stub(transpilerFacade, 'default').returns(transpilerFacadeMock);
    transpiledFilesOne = [new File('firstResult.js', 'first result')];
    transpiledFilesTwo = [new File('secondResult.js', 'second result')];
    transpilerFacadeMock.transpile
      .onFirstCall().resolves(transpiledFilesOne)
      .onSecondCall().resolves(transpiledFilesTwo);
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
        { config: expectedConfig, produceSourceMaps: false });
    });

    describe('initialize', () => {

      it('should transpile all files', () => {
        const expectedFiles = [file()];
        sut = new MutantTranspiler(config({ transpilers: ['transpiler'] }));
        const actualResult = sut.initialize(expectedFiles);
        expect(transpilerFacadeMock.transpile).calledWith(expectedFiles);
        return expect(actualResult).eventually.eq(transpiledFilesOne);
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
        const expected: TranspiledMutant[] = [
          { mutant: mutants[0], transpileResult: { error: null, outputFiles: transpiledFilesOne }, changedAnyTranspiledFiles: true },
          { mutant: mutants[1], transpileResult: { error: null, outputFiles: transpiledFilesTwo }, changedAnyTranspiledFiles: true }
        ];
        expect(actualResult).deep.eq(expected);
      });

      it('should report rejected transpile attempts as errors', async () => {
        // Arrange
        const error = new Error('expected transpile error');
        transpilerFacadeMock.transpile.reset();
        transpilerFacadeMock.transpile.rejects(error);
        const mutant = testableMutant();

        // Act
        const actualResult = await sut.transpileMutants([mutant])
          .toArray()
          .toPromise();

        // Assert
        const expected: TranspiledMutant[] = [
          { mutant, transpileResult: { error: errorToString(error), outputFiles: [] }, changedAnyTranspiledFiles: false },
        ];
        expect(actualResult).deep.eq(expected);
      });

      it('should set set the changedAnyTranspiledFiles boolean to false if transpiled output did not change', async () => {
        // Arrange
        transpilerFacadeMock.transpile.reset();
        transpilerFacadeMock.transpile.resolves(transpiledFilesOne);
        const mutants = [testableMutant()];
        const files = [file()];
        await sut.initialize(files);

        // Act
        const actual = await sut.transpileMutants(mutants)
          .toArray()
          .toPromise();

        // Assert
        const expected: TranspiledMutant[] = [
          { mutant: mutants[0], transpileResult: { error: null, outputFiles: transpiledFilesOne }, changedAnyTranspiledFiles: false }
        ];
        expect(actual).deep.eq(expected);
      });

      it('should transpile mutants one by one in sequence', async () => {
        // Arrange
        let resolveFirst: (files: ReadonlyArray<File>) => void = () => { };
        let resolveSecond: (files: ReadonlyArray<File>) => void = () => { };
        transpilerFacadeMock.transpile.resetBehavior();
        transpilerFacadeMock.transpile
          .onFirstCall().returns(new Promise<ReadonlyArray<File>>(res => resolveFirst = res))
          .onSecondCall().returns(new Promise<ReadonlyArray<File>>(res => resolveSecond = res));
        const actualResults: TranspileResult[] = [];

        // Act
        sut.transpileMutants([testableMutant('one'), testableMutant('two')])
          .subscribe(transpiledMutant => actualResults.push(transpiledMutant.transpileResult));

        // Assert: only first time called
        expect(transpilerFacadeMock.transpile).calledOnce;
        expect(actualResults).lengthOf(0);
        resolveFirst(transpiledFilesOne);
        await nextTick();
        // Assert: second one is called, first one is received
        expect(transpilerFacadeMock.transpile).calledTwice;
        expect(actualResults).lengthOf(1);
        resolveSecond(transpiledFilesTwo);
        // Assert: all results are in
        await nextTick();
        const expectedResults: TranspileResult[] = [
          { error: null, outputFiles: transpiledFilesOne },
          { error: null, outputFiles: transpiledFilesTwo }
        ];
        expect(actualResults).deep.eq(expectedResults);
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
      const expectedFiles = [file()];
      const actualFiles = await sut.initialize(expectedFiles);
      expect(transpilerFacadeMock.transpile).calledWith(expectedFiles);
      expect(actualFiles).eq(transpiledFilesOne);
    });

    it('should transpile the mutated files when transpileMutants is called', async () => {
      const actualMutants = [testableMutant('file1.ts'), testableMutant('file2.ts')];
      const actualResult = await sut.transpileMutants(actualMutants).toArray().toPromise();
      expect(actualResult).lengthOf(2);
      expect(actualResult[0].transpileResult.outputFiles).eq(transpiledFilesOne);
      expect(actualResult[0].mutant).eq(actualMutants[0]);
      expect(actualResult[1].transpileResult.outputFiles).eq(transpiledFilesTwo);
      expect(actualResult[1].mutant).eq(actualMutants[1]);
    });

    it('should not dispose anything when `dispose` is called', () => {
      sut.dispose();
      expect(childProcessProxyMock.dispose).not.called;
    });
  });

});