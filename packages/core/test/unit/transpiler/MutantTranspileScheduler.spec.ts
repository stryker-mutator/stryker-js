import { expect } from 'chai';
import * as sinon from 'sinon';
import { range } from 'rxjs';
import { toArray, map } from 'rxjs/operators';
import { File } from '@stryker-mutator/api/core';
import TranspiledMutant from '../../../src/TranspiledMutant';
import { MutantTranspileScheduler } from '../../../src/transpiler/MutantTranspileScheduler';
import TranspileResult from '../../../src/transpiler/TranspileResult';
import { testableMutant } from '../../helpers/producers';
import { errorToString } from '@stryker-mutator/util';
import { Transpiler } from '@stryker-mutator/api/transpile';
import { TEST_INJECTOR } from '@stryker-mutator/test-helpers';
import { coreTokens } from '../../../src/di';
import { sleep } from '../../helpers/testUtils';
import { Disposable } from '@stryker-mutator/api/plugin';

describe(MutantTranspileScheduler.name, () => {
  let sut: MutantTranspileScheduler;
  let transpilerMock: sinon.SinonStubbedInstance<Transpiler & Disposable>;
  let initialTranspiledFiles: File[];
  let transpiledFilesOne: File[];
  let transpiledFilesTwo: File[];

  beforeEach(() => {
    initialTranspiledFiles = [new File('firstResult.js', 'initial result')];
    transpilerMock = {
      dispose: sinon.stub(),
      transpile: sinon.stub()
    };
    transpiledFilesOne = [new File('firstResult.js', 'first result')];
    transpiledFilesTwo = [new File('secondResult.js', 'second result')];
    sut = TEST_INJECTOR.injector
      .provideValue(coreTokens.TranspiledFiles, initialTranspiledFiles)
      .provideValue(coreTokens.Transpiler, transpilerMock as unknown as Transpiler & Disposable)
      .injectClass(MutantTranspileScheduler);
  });

  it('should transpile mutants', async () => {
    // Arrange
    const mutants = [testableMutant(), testableMutant()];
    transpilerMock.transpile
      .onFirstCall().resolves(transpiledFilesOne)
      .onSecondCall().resolves(transpiledFilesTwo);
    const expected: TranspiledMutant[] = [
      { mutant: mutants[0], transpileResult: { error: null, outputFiles: transpiledFilesOne }, changedAnyTranspiledFiles: true },
      { mutant: mutants[1], transpileResult: { error: null, outputFiles: transpiledFilesTwo }, changedAnyTranspiledFiles: true }
    ];

    // Act
    const actualResult = await sut.scheduleTranspileMutants(mutants)
      .pipe(toArray())
      .toPromise();

    // Assert
    expect(actualResult).deep.eq(expected);
  });

  it('should report rejected transpile attempts as errors', async () => {
    // Arrange
    const error = new Error('expected transpile error');
    transpilerMock.transpile.rejects(error);
    const mutant = testableMutant();

    // Act
    const actualResult = await sut.scheduleTranspileMutants([mutant])
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
    transpilerMock.transpile.resolves(initialTranspiledFiles);
    const mutants = [testableMutant()];

    // Act
    const actual = await sut.scheduleTranspileMutants(mutants)
      .pipe(toArray())
      .toPromise();

    // Assert
    const expected: TranspiledMutant[] = [
      { mutant: mutants[0], transpileResult: { error: null, outputFiles: initialTranspiledFiles }, changedAnyTranspiledFiles: false }
    ];
    expect(actual).deep.eq(expected);
  });

  it('should transpile mutants one by one in sequence', async () => {
    // Arrange
    let resolveFirst: (files: ReadonlyArray<File>) => void = () => { };
    let resolveSecond: (files: ReadonlyArray<File>) => void = () => { };
    transpilerMock.transpile
      .onFirstCall().returns(new Promise<ReadonlyArray<File>>(res => resolveFirst = res))
      .onSecondCall().returns(new Promise<ReadonlyArray<File>>(res => resolveSecond = res));
    const actualResults: TranspileResult[] = [];

    // Act
    sut.scheduleTranspileMutants([testableMutant('one'), testableMutant('two')])
      .subscribe(transpiledMutant => actualResults.push(transpiledMutant.transpileResult));

    // Assert: only first time called
    expect(transpilerMock.transpile).calledOnce;
    expect(actualResults).lengthOf(0);
    resolveFirst(transpiledFilesOne);
    await sleep();
    // Assert: second one is called, first one is received
    expect(transpilerMock.transpile).calledTwice;
    expect(actualResults).lengthOf(1);
    resolveSecond(transpiledFilesTwo);
    // Assert: all results are in
    await sleep();
    const expectedResults: TranspileResult[] = [
      { error: null, outputFiles: transpiledFilesOne },
      { error: null, outputFiles: transpiledFilesTwo }
    ];
    expect(actualResults).deep.eq(expectedResults);
  });

  const maxConcurrency = 100;
  it(`should transpile ${maxConcurrency} mutants at a time and not transpile more until \`scheduleNext\` is called`, async () => {    // Arrange
    transpilerMock.transpile.resolves(initialTranspiledFiles);
    const input = await range(0, maxConcurrency + 1).pipe(
      map(i => testableMutant(i.toString())),
      toArray()
    ).toPromise();
    const actualResult: TranspiledMutant[] = [];
    const subscription = sut.scheduleTranspileMutants(input).subscribe(mutant => actualResult.push(mutant));

    // Act & assert
    await sleep();
    expect(actualResult).lengthOf(maxConcurrency);
    sut.scheduleNext();
    await sleep();
    expect(actualResult).lengthOf(maxConcurrency + 1);
    subscription.unsubscribe();
  });
});
