import { File } from '@stryker-mutator/api/core';
import { Mutant } from '@stryker-mutator/api/mutant';
import { mutant, runResult, testResult } from '@stryker-mutator/test-helpers/src/factory';
import { expect } from 'chai';

import SourceFile from '../../src/SourceFile';
import TestableMutant, { TestSelectionResult } from '../../src/TestableMutant';

describe(TestableMutant.name, () => {
  let innerMutant: Mutant;

  beforeEach(() => {
    innerMutant = mutant();
  });

  it('should pass properties from mutant and source code', () => {
    const sut = new TestableMutant('3', innerMutant, new SourceFile(new File(innerMutant.fileName, 'alert("foobar")')));
    expect(sut.id).eq('3');
    expect(sut.fileName).eq(innerMutant.fileName);
    expect(sut.range).eq(innerMutant.range);
    expect(sut.mutatorName).eq(innerMutant.mutatorName);
    expect(sut.replacement).eq(innerMutant.replacement);
    expect(sut.originalCode).eq('alert("foobar")');
  });

  it('should reflect timeSpentScopedTests, scopedTestIds and TestSelectionResult', () => {
    const sut = new TestableMutant('3', innerMutant, new SourceFile(new File('foobar.js', 'alert("foobar")')));
    sut.selectAllTests(
      runResult({ tests: [testResult({ name: 'spec1', timeSpentMs: 12 }), testResult({ name: 'spec2', timeSpentMs: 42 })] }),
      TestSelectionResult.FailedButAlreadyReported
    );
    expect(sut.timeSpentScopedTests).eq(54);
    expect(sut.runAllTests).true;
    expect(sut.testSelectionResult).eq(TestSelectionResult.FailedButAlreadyReported);
  });

  it('should scope tests when selecting individual tests', () => {
    const sut = new TestableMutant('3', innerMutant, new SourceFile(new File('foobar.js', 'alert("foobar")')));
    sut.selectTest(testResult({ name: 'spec1', timeSpentMs: 12 }), 0);
    sut.selectTest(testResult({ name: 'spec3', timeSpentMs: 32 }), 2);
    expect(sut.timeSpentScopedTests).eq(44);
    expect(sut.selectedTests).deep.eq([{ id: 0, name: 'spec1' }, { id: 2, name: 'spec3' }]);
    expect(sut.testSelectionResult).eq(TestSelectionResult.Success);
  });

  it('should calculate position using sourceFile', () => {
    const sut = new TestableMutant('3', innerMutant, new SourceFile(new File('foobar.js', 'some content')));
    innerMutant.range = [1, 2];
    expect(sut.location).deep.eq({ start: { line: 0, column: 1 }, end: { line: 0, column: 2 } });
  });

  it('should return original code with mutant replacement when `mutatedCode` is requested', () => {
    const innerFile = new File('', 'some content');
    const sut = new TestableMutant('3', innerMutant, new SourceFile(innerFile));
    innerMutant.range = [4, 5];
    innerMutant.replacement = ' mutated! ';
    expect(sut.mutatedCode).eq('some mutated! content');
  });

  it('should be able to retrieve original lines and mutated lines', () => {
    const innerFile = new File('', 'line 1\nline 2\nline 3\nline 4');
    const sut = new TestableMutant('3', innerMutant, new SourceFile(innerFile));
    innerMutant.range = [11, 12];
    innerMutant.replacement = ' mutated! ';
    expect(sut.originalLines).eq('line 2');
    expect(sut.mutatedLines).eq('line mutated! 2');
  });
});
