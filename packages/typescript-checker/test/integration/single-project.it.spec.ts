import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { testInjector, factory, assertions } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { Location, Mutant } from '@stryker-mutator/api/core';
import { CheckResult, CheckStatus } from '@stryker-mutator/api/check';

import { createTypescriptChecker } from '../../src/index.js';
import { TypescriptChecker } from '../../src/typescript-checker.js';

const resolveTestResource = path.resolve.bind(
  path,
  path.dirname(fileURLToPath(import.meta.url)),
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
  'single-project'
) as unknown as typeof path.resolve;

describe('Typescript checker on a single project', () => {
  let sut: TypescriptChecker;

  beforeEach(() => {
    testInjector.options.tsconfigFile = resolveTestResource('tsconfig.json');
    sut = testInjector.injector.injectFunction(createTypescriptChecker);
    return sut.init();
  });

  it('should not write output to disk', () => {
    expect(fs.existsSync(resolveTestResource('dist')), 'Output was written to disk!').false;
  });

  it('should be able to validate a mutant that does not result in an error', async () => {
    const mutant = createMutant('todo.ts', 'TodoList.allTodos.push(newItem)', 'newItem? 42: 43', '42');
    const expectedResult: Record<string, CheckResult> = { '42': { status: CheckStatus.Passed } };
    const actual = await sut.check([mutant]);
    expect(actual).deep.eq(expectedResult);
  });

  it('should be able invalidate a mutant that does result in a compile error', async () => {
    const mutant = createMutant('todo.ts', 'TodoList.allTodos.push(newItem)', '"This should not be a string 🙄"', 'mutId');
    const actual = await sut.check([mutant]);
    assertions.expectCompileError(actual.mutId);
    expect(actual.mutId.reason).has.string('todo.ts(15,9): error TS2322');
  });

  it('should be able validate a mutant that does not result in a compile error after a compile error', async () => {
    // Arrange
    const mutantCompileError = createMutant('todo.ts', 'TodoList.allTodos.push(newItem)', '"This should not be a string 🙄"');
    const mutantWithoutError = createMutant('todo.ts', 'return TodoList.allTodos', '[]', 'mut42', 7);
    const expectedResult: Record<string, CheckResult> = { mut42: { status: CheckStatus.Passed } };

    // Act
    await sut.check([mutantCompileError]);
    const actual = await sut.check([mutantWithoutError]);

    // Assert
    expect(actual).deep.eq(expectedResult);
  });

  it('should be able to invalidate a mutant that results in an error in a different file', async () => {
    const actual = await sut.check([createMutant('todo.ts', 'return totalCount;', '', '42')]);
    assertions.expectCompileError(actual['42']);
    expect(actual['42'].reason).has.string('todo.spec.ts(4,7): error TS2322');
  });

  it('should be able to validate a mutant after a mutant in a different file resulted in a transpile error', async () => {
    // Act
    await sut.check([createMutant('todo.ts', 'return totalCount;', '')]);
    const result = await sut.check([createMutant('todo.spec.ts', "'Mow lawn'", "'this is valid, right?'", 'id42')]);

    // Assert
    const expectedResult: Record<string, CheckResult> = { id42: { status: CheckStatus.Passed } };
    expect(result).deep.eq(expectedResult);
  });

  it('should be allow mutations in unrelated files', async () => {
    // Act
    const result = await sut.check([createMutant('not-type-checked.js', 'bar', 'baz', 'id1')]);

    // Assert
    const expectedResult: Record<string, CheckResult> = { id1: { status: CheckStatus.Passed } };
    expect(result).deep.eq(expectedResult);
  });

  it('should allow unused local variables (override options)', async () => {
    const mutant = createMutant('todo.ts', 'TodoList.allTodos.push(newItem)', '42', 'id45');
    const expectedResult: Record<string, CheckResult> = { id45: { status: CheckStatus.Passed } };
    const actual = await sut.check([mutant]);
    expect(actual).deep.eq(expectedResult);
  });
});

const fileContents = Object.freeze({
  ['todo.ts']: fs.readFileSync(resolveTestResource('src', 'todo.ts'), 'utf8'),
  ['todo.spec.ts']: fs.readFileSync(resolveTestResource('src', 'todo.spec.ts'), 'utf8'),
  ['not-type-checked.js']: fs.readFileSync(resolveTestResource('src', 'not-type-checked.js'), 'utf8'),
});

function createMutant(
  fileName: 'not-type-checked.js' | 'todo.spec.ts' | 'todo.ts',
  findText: string,
  replacement: string,
  id = '42',
  offset = 0
): Mutant {
  const lines = fileContents[fileName].split('\n');
  const lineNumber = lines.findIndex((line) => line.includes(findText));
  if (lineNumber === -1) {
    throw new Error(`Cannot find ${findText} in ${fileName}`);
  }
  const textColumn = lines[lineNumber].indexOf(findText);
  const location: Location = {
    start: { line: lineNumber, column: textColumn + offset },
    end: { line: lineNumber, column: textColumn + findText.length },
  };
  return factory.mutant({
    id,
    fileName: resolveTestResource('src', fileName),
    mutatorName: 'foo-mutator',
    location,
    replacement,
  });
}
