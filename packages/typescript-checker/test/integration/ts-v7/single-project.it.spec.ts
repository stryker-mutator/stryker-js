import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import {
  testInjector,
  factory,
  assertions,
} from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { Location, Mutant } from '@stryker-mutator/api/core';
import { CheckResult, CheckStatus } from '@stryker-mutator/api/check';

import { createTypescriptChecker } from '../../../src/index.js';
import { NativeTypescriptChecker } from '../../../src/ts-v7/native-typescript-checker.js';
import { TypescriptCheckerOptionsWithStrykerOptions } from '../../../src/typescript-checker-options-with-stryker-options.js';

const resolveTestResource = path.resolve.bind(
  path,
  path.dirname(fileURLToPath(import.meta.url)),
  '..' /* ts-v7 */,
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
  'single-project',
) as unknown as typeof path.resolve;

describe('Typescript checker (native preview) on a single project', () => {
  let sut: NativeTypescriptChecker;

  beforeEach(() => {
    (
      testInjector.options as TypescriptCheckerOptionsWithStrykerOptions
    ).typescriptChecker = {
      prioritizePerformanceOverAccuracy: true,
      experimentalNativePreview: true,
    };
    testInjector.options.tsconfigFile = resolveTestResource('tsconfig.json');
    sut = testInjector.injector.injectFunction(
      createTypescriptChecker,
    ) as NativeTypescriptChecker;
    return sut.init();
  });

  afterEach(() => {
    sut.dispose();
  });

  it('should create a checker that uses the native TypeScript compiler', () => {
    expect(sut).instanceOf(NativeTypescriptChecker);
  });

  it('should not write output to disk', () => {
    expect(
      fs.existsSync(resolveTestResource('dist')),
      'Output was written to disk!',
    ).false;
  });

  it('should be able to validate a mutant that does not result in an error', async () => {
    const mutant = createMutant(
      'todo.ts',
      'TodoList.allTodos.push(newItem)',
      'newItem? 42: 43',
      '42',
    );
    const expectedResult: Record<string, CheckResult> = {
      '42': { status: CheckStatus.Passed },
    };
    const actual = await sut.check([mutant]);
    expect(actual).deep.eq(expectedResult);
  });

  it('should be able invalidate a mutant that does result in a compile error', async () => {
    const mutant = createMutant(
      'todo.ts',
      'TodoList.allTodos.push(newItem)',
      '"This should not be a string 🙄"',
      'mutId',
    );
    const actual = await sut.check([mutant]);
    assertions.expectCompileError(actual.mutId);
    expect(actual.mutId.reason).has.string('todo.ts(15,9): error TS2322');
  });

  it('should be able validate a mutant that does not result in a compile error after a compile error', async () => {
    // Arrange
    const mutantCompileError = createMutant(
      'todo.ts',
      'TodoList.allTodos.push(newItem)',
      '"This should not be a string 🙄"',
    );
    const mutantWithoutError = createMutant(
      'todo.ts',
      'return TodoList.allTodos',
      '[]',
      'mut42',
      7,
    );
    const expectedResult: Record<string, CheckResult> = {
      mut42: { status: CheckStatus.Passed },
    };

    // Act
    await sut.check([mutantCompileError]);
    const actual = await sut.check([mutantWithoutError]);

    // Assert
    expect(actual).deep.eq(expectedResult);
  });

  it('should be able to invalidate a mutant that results in an error in a different file', async () => {
    const actual = await sut.check([
      createMutant('todo.ts', 'return totalCount;', '', '42'),
    ]);
    assertions.expectCompileError(actual['42']);
    expect(actual['42'].reason).has.string('todo.spec.ts(4,7): error TS2322');
  });

  it('should be able to validate a mutant after a mutant in a different file resulted in a transpile error', async () => {
    // Act
    await sut.check([createMutant('todo.ts', 'return totalCount;', '')]);
    const result = await sut.check([
      createMutant(
        'todo.spec.ts',
        "'Mow lawn'",
        "'this is valid, right?'",
        'id42',
      ),
    ]);

    // Assert
    const expectedResult: Record<string, CheckResult> = {
      id42: { status: CheckStatus.Passed },
    };
    expect(result).deep.eq(expectedResult);
  });

  it('should allow mutations in unrelated files', async () => {
    // Act
    const result = await sut.check([
      createMutant('not-type-checked.js', 'bar', 'baz', 'id1'),
    ]);

    // Assert
    const expectedResult: Record<string, CheckResult> = {
      id1: { status: CheckStatus.Passed },
    };
    expect(result).deep.eq(expectedResult);
  });

  it('should allow unused local variables (override options)', async () => {
    const mutant = createMutant(
      'todo.ts',
      'TodoList.allTodos.push(newItem)',
      '42',
      'id45',
    );
    const expectedResult: Record<string, CheckResult> = {
      id45: { status: CheckStatus.Passed },
    };
    const actual = await sut.check([mutant]);
    expect(actual).deep.eq(expectedResult);
  });

  it('should be able invalidate 2 mutants that do result in a compile error', async () => {
    const mutant = createMutant(
      'todo.ts',
      'TodoList.allTodos.push(newItem)',
      '"This should not be a string 🙄"',
      'mutId',
    );
    const mutant2 = createMutant(
      'counter.ts',
      'return this.currentNumber;',
      'return "This should not return a string 🙄"',
      'mutId2',
    );
    const actual = await sut.check([mutant, mutant2]);
    assertions.expectCompileError(actual.mutId);
    assertions.expectCompileError(actual.mutId2);
    expect(actual.mutId.reason).has.string('todo.ts(15,9): error TS2322');
    expect(actual.mutId2.reason).has.string('counter.ts(7,5): error TS2322');
  });

  it('should group mutants outside the project together and check project mutants one-by-one', async () => {
    const mutantOutsideProject = createMutant(
      'not-type-checked.js',
      'bar',
      'baz',
      'outside',
    );
    const mutantInProject = createMutant(
      'todo.ts',
      'return totalCount;',
      '',
      'inside1',
    );
    const mutantInProject2 = createMutant(
      'counter.ts',
      'return this.currentNumber;',
      'return 42;',
      'inside2',
    );
    const groups = await sut.group([
      mutantOutsideProject,
      mutantInProject,
      mutantInProject2,
    ]);
    expect(groups).deep.eq([['outside'], ['inside1'], ['inside2']]);
  });
});

const fileContents = Object.freeze({
  ['todo.ts']: fs.readFileSync(resolveTestResource('src', 'todo.ts'), 'utf8'),
  ['counter.ts']: fs.readFileSync(
    resolveTestResource('src', 'counter.ts'),
    'utf8',
  ),
  ['todo.spec.ts']: fs.readFileSync(
    resolveTestResource('src', 'todo.spec.ts'),
    'utf8',
  ),
  ['not-type-checked.js']: fs.readFileSync(
    resolveTestResource('src', 'not-type-checked.js'),
    'utf8',
  ),
});

function createMutant(
  fileName: 'counter.ts' | 'not-type-checked.js' | 'todo.spec.ts' | 'todo.ts',
  findText: string,
  replacement: string,
  id = '42',
  offset = 0,
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
