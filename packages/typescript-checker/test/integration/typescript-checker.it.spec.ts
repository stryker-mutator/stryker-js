import path from 'path';
import fs from 'fs';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { Mutant } from '@stryker-mutator/api/mutant';
import { Range } from '@stryker-mutator/api/core';
import { CheckResult } from '@stryker-mutator/api/check';
import { MutantStatus } from '@stryker-mutator/api/report';

import { TypescriptChecker } from '../../src';

const resolveTestResource = (path.resolve.bind(
  path,
  __dirname,
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources'
) as unknown) as typeof path.resolve;

describe('simple project', () => {
  let sut: TypescriptChecker;
  const fileContents = Object.freeze({
    ['todo.ts']: fs.readFileSync(resolveTestResource('simple-project', 'todo.ts'), 'utf8'),
    ['todo.spec.ts']: fs.readFileSync(resolveTestResource('simple-project', 'todo.spec.ts'), 'utf8'),
  });

  function createMutant(fileName: 'todo.ts' | 'todo.spec.ts', findText: string, replacement: string, offset: number = 0): Mutant {
    const originalOffset: number = fileContents[fileName].indexOf(findText);
    if (originalOffset === -1) {
      throw new Error(`Cannot find ${findText} in ${fileName}`);
    }
    const range: Range = [originalOffset + offset, originalOffset + findText.length];
    return {
      fileName: resolveTestResource('simple-project', fileName),
      mutatorName: 'foo-mutator',
      range,
      replacement,
    };
  }

  beforeEach(() => {
    sut = testInjector.injector.injectClass(TypescriptChecker);
    process.chdir(resolveTestResource('simple-project'));
    return sut.initialize();
  });

  it('should be able to validate a mutant that does not result in an error', async () => {
    const mutant = createMutant('todo.ts', 'TodoList.allTodos.push(newItem)', '42');
    const expectedResult: CheckResult = {
      mutantResult: MutantStatus.Survived,
    };
    const actual = await sut.check(mutant);
    expect(actual).deep.eq(expectedResult);
  });

  it('should be able invalidate a mutant that does result in a compile error', async () => {
    const mutant = createMutant('todo.ts', 'TodoList.allTodos.push(newItem)', '"This should not be a string 🙄"');
    const actual = await sut.check(mutant);
    expect(actual.mutantResult).deep.eq(MutantStatus.TranspileError);
    expect(actual.reason).has.string('todo.ts(15,9): error TS2322');
  });

  it('should be able validate a mutant that does not result in a compile error after a compile error', async () => {
    // Arrange
    const mutantCompileError = createMutant('todo.ts', 'TodoList.allTodos.push(newItem)', '"This should not be a string 🙄"');
    const mutantWithoutError = createMutant('todo.ts', 'return TodoList.allTodos', '[]', 7);
    const expectedResult: CheckResult = {
      mutantResult: MutantStatus.Survived,
    };

    // Act
    await sut.check(mutantCompileError);
    const actual = await sut.check(mutantWithoutError);

    // Assert
    expect(actual).deep.eq(expectedResult);
  });

  it('should be able to invalidate a mutant that results in an error in a different file', async () => {
    const result = await sut.check(createMutant('todo.ts', 'return totalCount;', ''));
    expect(result.mutantResult).eq(MutantStatus.TranspileError);
    expect(result.reason).has.string('todo.spec.ts(4,7): error TS2322');
  });

  it('should be able to validate a mutant after a mutant in a different file resulted in a transpile error', async () => {
    // Act
    await sut.check(createMutant('todo.ts', 'return totalCount;', ''));
    const result = await sut.check(createMutant('todo.spec.ts', "'Mow lawn'", "'this is valid, right?'"));

    // Assert
    const expectedResult: CheckResult = {
      mutantResult: MutantStatus.Survived,
    };
    expect(result).deep.eq(expectedResult);
  });
});
