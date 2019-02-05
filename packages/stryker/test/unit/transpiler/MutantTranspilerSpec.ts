import { expect } from 'chai';
import { toArray } from 'rxjs/operators';
import { File, LogLevel } from 'stryker-api/core';
import TranspiledMutant from '../../../src/TranspiledMutant';
import ChildProcessProxy from '../../../src/child-proxy/ChildProcessProxy';
import MutantTranspiler from '../../../src/transpiler/MutantTranspiler';
import TranspileResult from '../../../src/transpiler/TranspileResult';
import { Mock, config, file, mock, testableMutant } from '../../helpers/producers';
import LoggingClientContext from '../../../src/logging/LoggingClientContext';
import { sleep } from '../../helpers/testUtils';
import * as sinon from 'sinon';
import { errorToString } from '@stryker-mutator/util';
import { Transpiler } from 'stryker-api/transpile';
import { TranspilerFacade } from '../../../src/transpiler/TranspilerFacade';
import { commonTokens } from 'stryker-api/plugin';
import { ChildProcessTranspilerWorker } from '../../../src/transpiler/ChildProcessTranspilerWorker';

const LOGGING_CONTEXT: LoggingClientContext = Object.freeze({
  level: LogLevel.Fatal,
  port: 4200
});

describe('MutantTranspiler', () => {
  let sut: MutantTranspiler;
  let transpiledFilesOne: File[];
  let transpiledFilesTwo: File[];
  let childProcessProxyMock: { proxy: Mock<Transpiler>, dispose: sinon.SinonStub };

  beforeEach(() => {
    const transpilerFacadeMock = mock(TranspilerFacade);
    childProcessProxyMock = { proxy: transpilerFacadeMock, dispose: sinon.stub() };
    sinon.stub(ChildProcessProxy, 'create').returns(childProcessProxyMock);
    transpiledFilesOne = [new File('firstResult.js', 'first result')];
    transpiledFilesTwo = [new File('secondResult.js', 'second result')];
    transpilerFacadeMock.transpile
      .onFirstCall().resolves(transpiledFilesOne)
      .onSecondCall().resolves(transpiledFilesTwo);
  });

  describe('with a transpiler', () => {

    it('should construct use the ChildProcessProxy to spawn a new MutantTranspiler in a separated process', () => {
      const expectedConfig = config({ transpilers: ['transpiler'], plugins: ['plugin1'] });
      sut = new MutantTranspiler(expectedConfig, LOGGING_CONTEXT);
      expect(ChildProcessProxy.create).calledWith(
        require.resolve('../../../src/transpiler/ChildProcessTranspilerWorker'),
        LOGGING_CONTEXT,
        expectedConfig,
        { [commonTokens.produceSourceMaps]: false },
        process.cwd(),
        ChildProcessTranspilerWorker
      );
    });

    describe('initialize', () => {

      it('should transpile all files', () => {
        const expectedFiles = [file()];
        sut = new MutantTranspiler(config({ transpilers: ['transpiler'] }), LOGGING_CONTEXT);
        const actualResult = sut.initialize(expectedFiles);
        expect(childProcessProxyMock.proxy.transpile).calledWith(expectedFiles);
        return expect(actualResult).eventually.eq(transpiledFilesOne);
      });
    });

    describe('dispose', () => {
      it('should dispose the child process', () => {
        sut = new MutantTranspiler(config({ transpilers: ['transpiler'] }), LOGGING_CONTEXT);
        sut.dispose();
        expect(childProcessProxyMock.dispose).called;
      });
    });

    describe('transpileMutants', () => {

      beforeEach(() => {
        sut = new MutantTranspiler(config({ transpilers: ['transpiler'] }), LOGGING_CONTEXT);
      });

      it('should transpile mutants', async () => {
        const mutants = [testableMutant(), testableMutant()];
        const actualResult = await sut.transpileMutants(mutants)
          .pipe(toArray())
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
        childProcessProxyMock.proxy.transpile.reset();
        childProcessProxyMock.proxy.transpile.rejects(error);
        const mutant = testableMutant();

        // Act
        const actualResult = await sut.transpileMutants([mutant])
          .pipe(toArray())
          .toPromise();

        // Assert
        const expected: TranspiledMutant[] = [
          { mutant, transpileResult: { error: errorToString(error), outputFiles: [] }, changedAnyTranspiledFiles: false },
        ];
        expect(actualResult).deep.eq(expected);
      });

      it('should set set the changedAnyTranspiledFiles boolean to false if transpiled output did not change', async () => {
        // Arrange
        childProcessProxyMock.proxy.transpile.reset();
        childProcessProxyMock.proxy.transpile.resolves(transpiledFilesOne);
        const mutants = [testableMutant()];
        const files = [file()];
        await sut.initialize(files);

        // Act
        const actual = await sut.transpileMutants(mutants)
          .pipe(toArray())
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
        childProcessProxyMock.proxy.transpile.resetBehavior();
        childProcessProxyMock.proxy.transpile
          .onFirstCall().returns(new Promise<ReadonlyArray<File>>(res => resolveFirst = res))
          .onSecondCall().returns(new Promise<ReadonlyArray<File>>(res => resolveSecond = res));
        const actualResults: TranspileResult[] = [];

        // Act
        sut.transpileMutants([testableMutant('one'), testableMutant('two')])
          .subscribe(transpiledMutant => actualResults.push(transpiledMutant.transpileResult));

        // Assert: only first time called
        expect(childProcessProxyMock.proxy.transpile).calledOnce;
        expect(actualResults).lengthOf(0);
        resolveFirst(transpiledFilesOne);
        await nextTick();
        // Assert: second one is called, first one is received
        expect(childProcessProxyMock.proxy.transpile).calledTwice;
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
      const nextTick = sleep;
    });
  });

  describe('without a transpiler', () => {

    beforeEach(() => {
      sut = new MutantTranspiler(config(), LOGGING_CONTEXT);
    });

    it('should construct without a child process', () => {
      expect(ChildProcessProxy.create).not.called;
    });

    it('should transpile the files when initialized', async () => {
      const expectedFiles = [file()];
      const actualFiles = await sut.initialize(expectedFiles);
      expect(actualFiles).eq(expectedFiles);
    });

    it('should transpile the mutated files when transpileMutants is called', async () => {
      const actualMutants = [testableMutant('file1.ts'), testableMutant('file2.ts')];
      const actualResult = await sut.transpileMutants(actualMutants).pipe(toArray()).toPromise();
      expect(actualResult).lengthOf(2);
      expect(actualResult[0].transpileResult.outputFiles).lengthOf(1);
      expect(actualResult[0].transpileResult.outputFiles[0].textContent).eq('const a = 4 - 5');
      expect(actualResult[0].mutant).eq(actualMutants[0]);
      expect(actualResult[1].transpileResult.outputFiles).lengthOf(2);
      expect(actualResult[1].transpileResult.outputFiles[0].textContent).eq('const a = 4 + 5');
      expect(actualResult[1].transpileResult.outputFiles[1].textContent).eq('const a = 4 - 5');
      expect(actualResult[1].mutant).eq(actualMutants[1]);
    });

    it('should not dispose anything when `dispose` is called', () => {
      sut.dispose();
      expect(childProcessProxyMock.dispose).not.called;
    });
  });

});
