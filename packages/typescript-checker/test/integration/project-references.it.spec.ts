import path from 'path';
import fs from 'fs';

import { expect } from 'chai';
import { Mutant, Range } from '@stryker-mutator/api/core';
import { CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { testInjector } from '@stryker-mutator/test-helpers';

import { TypescriptChecker } from '../../src';
import { createTypescriptOptions } from '../helpers/factories';

const resolveTestResource = (path.resolve.bind(
  path,
  __dirname,
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
  'project-references'
) as unknown) as typeof path.resolve;

describe('Typescript checker on a project with project references', () => {
  let sut: TypescriptChecker;

  beforeEach(() => {
    process.chdir(resolveTestResource());
    testInjector.options.typescriptChecker = createTypescriptOptions({ tsconfigFile: 'tsconfig.root.json' });
    sut = testInjector.injector.injectClass(TypescriptChecker);
    return sut.init();
  });

  it('should not write output to disk', () => {
    expect(fs.existsSync(resolveTestResource('dist')), 'Output was written to disk!').false;
  });

  it('should be able to validate a mutant', async () => {
    const mutant = createMutant('src/todo.ts', 'TodoList.allTodos.push(newItem)', 'newItem ? 42 : 43');
    const expectedResult: CheckResult = {
      status: CheckStatus.Passed,
    };
    const actualResult = await sut.check(mutant);
    expect(actualResult).deep.eq(expectedResult);
  });

  it('should allow unused local variables (override options)', async () => {
    const mutant = createMutant('src/todo.ts', 'TodoList.allTodos.push(newItem)', '42');
    const expectedResult: CheckResult = {
      status: CheckStatus.Passed,
    };
    const actual = await sut.check(mutant);
    expect(actual).deep.eq(expectedResult);
  });
});

const fileContents = Object.freeze({
  ['src/todo.ts']: fs.readFileSync(resolveTestResource('src', 'todo.ts'), 'utf8'),
  ['test/todo.spec.ts']: fs.readFileSync(resolveTestResource('test', 'todo.spec.ts'), 'utf8'),
});

function createMutant(fileName: 'src/todo.ts' | 'test/todo.spec.ts', findText: string, replacement: string, offset: number = 0): Mutant {
  const originalOffset: number = fileContents[fileName].indexOf(findText);
  if (originalOffset === -1) {
    throw new Error(`Cannot find ${findText} in ${fileName}`);
  }
  const range: Range = [originalOffset + offset, originalOffset + findText.length];
  return {
    fileName: resolveTestResource(fileName),
    mutatorName: 'foo-mutator',
    range,
    replacement,
  };
}
