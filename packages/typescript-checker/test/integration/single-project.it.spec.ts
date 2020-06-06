import path from 'path';
import fs from 'fs';

import { testInjector } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { Mutant, Range } from '@stryker-mutator/api/core';
import { CheckResult, CheckStatus } from '@stryker-mutator/api/check';

import { TypescriptChecker } from '../../src';
import { createTypescriptOptions } from '../helpers/factories';

const resolveTestResource = (path.resolve.bind(
  path,
  __dirname,
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
  'single-project'
) as unknown) as typeof path.resolve;

describe('Typescript checker on a single project', () => {
  let sut: TypescriptChecker;

  beforeEach(() => {
    process.chdir(resolveTestResource());
    testInjector.options.typescriptChecker = createTypescriptOptions();
    sut = testInjector.injector.injectClass(TypescriptChecker);
    return sut.initialize();
  });

  it('should not write output to disk', () => {
    expect(fs.existsSync(resolveTestResource('dist')), 'Output was written to disk!').false;
  });

  it('should be able to validate a mutant that does not result in an error', async () => {
    const mutant = createMutant('todo.ts', 'TodoList.allTodos.push(newItem)', 'newItem? 42: 43');
    const expectedResult: CheckResult = {
      status: CheckStatus.Passed,
    };
    const actual = await sut.check(mutant);
    expect(actual).deep.eq(expectedResult);
  });

  it('should be able invalidate a mutant that does result in a compile error', async () => {
    const mutant = createMutant('todo.ts', 'TodoList.allTodos.push(newItem)', '"This should not be a string 🙄"');
    const actual = await sut.check(mutant);
    expect(actual.status).deep.eq(CheckStatus.CompileError);
    expect(actual.reason).has.string('todo.ts(15,9): error TS2322');
  });

  it('should be able validate a mutant that does not result in a compile error after a compile error', async () => {
    // Arrange
    const mutantCompileError = createMutant('todo.ts', 'TodoList.allTodos.push(newItem)', '"This should not be a string 🙄"');
    const mutantWithoutError = createMutant('todo.ts', 'return TodoList.allTodos', '[]', 7);
    const expectedResult: CheckResult = {
      status: CheckStatus.Passed,
    };

    // Act
    await sut.check(mutantCompileError);
    const actual = await sut.check(mutantWithoutError);

    // Assert
    expect(actual).deep.eq(expectedResult);
  });

  it('should be able to invalidate a mutant that results in an error in a different file', async () => {
    const result = await sut.check(createMutant('todo.ts', 'return totalCount;', ''));
    expect(result.status).eq(CheckStatus.CompileError);
    expect(result.reason).has.string('todo.spec.ts(4,7): error TS2322');
  });

  it('should be able to validate a mutant after a mutant in a different file resulted in a transpile error', async () => {
    // Act
    await sut.check(createMutant('todo.ts', 'return totalCount;', ''));
    const result = await sut.check(createMutant('todo.spec.ts', "'Mow lawn'", "'this is valid, right?'"));

    // Assert
    const expectedResult: CheckResult = {
      status: CheckStatus.Passed,
    };
    expect(result).deep.eq(expectedResult);
  });

  it('should be allow mutations in unrelated files', async () => {
    // Act
    const result = await sut.check(createMutant('not-type-checked.js', 'bar', 'baz'));

    // Assert
    const expectedResult: CheckResult = {
      status: CheckStatus.Passed,
    };
    expect(result).deep.eq(expectedResult);
  });

  it('should allow unused local variables (override options)', async () => {
    const mutant = createMutant('todo.ts', 'TodoList.allTodos.push(newItem)', '42');
    const expectedResult: CheckResult = {
      status: CheckStatus.Passed,
    };
    const actual = await sut.check(mutant);
    expect(actual).deep.eq(expectedResult);
  });
});

const fileContents = Object.freeze({
  ['todo.ts']: fs.readFileSync(resolveTestResource('src', 'todo.ts'), 'utf8'),
  ['todo.spec.ts']: fs.readFileSync(resolveTestResource('src', 'todo.spec.ts'), 'utf8'),
  ['not-type-checked.js']: fs.readFileSync(resolveTestResource('src', 'not-type-checked.js'), 'utf8'),
});

function createMutant(
  fileName: 'todo.ts' | 'todo.spec.ts' | 'not-type-checked.js',
  findText: string,
  replacement: string,
  offset: number = 0
): Mutant {
  const originalOffset: number = fileContents[fileName].indexOf(findText);
  if (originalOffset === -1) {
    throw new Error(`Cannot find ${findText} in ${fileName}`);
  }
  const range: Range = [originalOffset + offset, originalOffset + findText.length];
  return {
    fileName: resolveTestResource('src', fileName),
    mutatorName: 'foo-mutator',
    range,
    replacement,
  };
}
