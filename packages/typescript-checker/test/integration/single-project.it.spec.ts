import path from 'path';
import fs from 'fs';

import { testInjector, factory, assertions } from '@stryker-mutator/test-helpers';
import { expect } from 'chai';
import { Location, MutantTestCoverage } from '@stryker-mutator/api/core';
import { CheckResult, CheckStatus } from '@stryker-mutator/api/check';

import { createTypescriptChecker } from '../../src';
import { TypescriptChecker } from '../../src/typescript-checker';

const resolveTestResource = path.resolve.bind(
  path,
  __dirname,
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
    const mutant = createMutantTestCoverage('todo.ts', 'TodoList.allTodos.push(newItem)', 'newItem? 42: 43');
    const expectedResult: CheckResult = { status: CheckStatus.Passed };
    const actual = await sut.check([mutant]);
    expect(actual).to.have.lengthOf(1);
    expect(actual[0].checkResult).deep.eq(expectedResult);
  });

  it('should be able invalidate a mutant that does result in a compile error', async () => {
    const mutant = createMutantTestCoverage('todo.ts', 'TodoList.allTodos.push(newItem)', '"This should not be a string 🙄"');
    const actual = await sut.check([mutant]);
    expect(actual).to.have.lengthOf(1);
    assertions.expectCompileError(actual[0].checkResult);
    expect(actual[0].checkResult.reason).has.string('todo.ts(15,9): error TS2322');
  });

  it('should be able validate a mutant that does not result in a compile error after a compile error', async () => {
    // Arrange
    const mutantCompileError = createMutantTestCoverage('todo.ts', 'TodoList.allTodos.push(newItem)', '"This should not be a string 🙄"');
    const mutantWithoutError = createMutantTestCoverage('todo.ts', 'return TodoList.allTodos', '[]', 7);
    const expectedResult: CheckResult = {
      status: CheckStatus.Passed,
    };

    // Act
    await sut.check([mutantCompileError]);
    const actual = await sut.check([mutantWithoutError]);

    // Assert
    expect(actual).to.have.lengthOf(1);
    expect(actual[0].checkResult).deep.eq(expectedResult);
  });

  it('should be able to invalidate a mutant that results in an error in a different file', async () => {
    const actual = await sut.check([createMutantTestCoverage('todo.ts', 'return totalCount;', '')]);
    assertions.expectCompileError(actual[0].checkResult);
    expect(actual).to.have.lengthOf(1);
    expect(actual[0].checkResult.reason).has.string('todo.spec.ts(4,7): error TS2322');
  });

  it('should be able to validate a mutant after a mutant in a different file resulted in a transpile error', async () => {
    // Act
    await sut.check([createMutantTestCoverage('todo.ts', 'return totalCount;', '')]);
    const result = await sut.check([createMutantTestCoverage('todo.spec.ts', "'Mow lawn'", "'this is valid, right?'")]);

    // Assert
    const expectedResult: CheckResult = {
      status: CheckStatus.Passed,
    };

    expect(result).to.have.lengthOf(1);
    expect(result[0].checkResult).deep.eq(expectedResult);
  });

  // it('should be allow mutations in unrelated files', async () => {
  //   // Act
  //   const result = await sut.check([createMutantTestCoverage('not-type-checked.js', 'bar', 'baz')]);

  //   // Assert
  //   const expectedResult: CheckResult = {
  //     status: CheckStatus.Passed,
  //   };

  //   expect(result).to.have.lengthOf(1);
  //   expect(result[0]).deep.eq(expectedResult);
  // });

  it('should allow unused local variables (override options)', async () => {
    const mutant = createMutantTestCoverage('todo.ts', 'TodoList.allTodos.push(newItem)', '42');
    const expectedResult: CheckResult = {
      status: CheckStatus.Passed,
    };
    const actual = await sut.check([mutant]);

    expect(actual).to.have.lengthOf(1);
    expect(actual[0].checkResult).deep.eq(expectedResult);
  });
});

const fileContents = Object.freeze({
  ['todo.ts']: fs.readFileSync(resolveTestResource('src', 'todo.ts'), 'utf8'),
  ['todo.spec.ts']: fs.readFileSync(resolveTestResource('src', 'todo.spec.ts'), 'utf8'),
  ['not-type-checked.js']: fs.readFileSync(resolveTestResource('src', 'not-type-checked.js'), 'utf8'),
});

function createMutantTestCoverage(
  fileName: 'not-type-checked.js' | 'todo.spec.ts' | 'todo.ts',
  findText: string,
  replacement: string,
  offset = 0
): MutantTestCoverage {
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
  return factory.mutantTestCoverage({
    fileName: resolveTestResource('src', fileName),
    mutatorName: 'foo-mutator',
    location,
    replacement,
  });
}
