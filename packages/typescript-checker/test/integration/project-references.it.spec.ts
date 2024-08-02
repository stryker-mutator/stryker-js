import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';

import { expect } from 'chai';
import { Location, Mutant } from '@stryker-mutator/api/core';
import { CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { testInjector, factory } from '@stryker-mutator/test-helpers';

import { createTypescriptChecker } from '../../src/index.js';
import { TypescriptChecker } from '../../src/typescript-checker.js';
import { TypescriptCheckerOptionsWithStrykerOptions } from '../../src/typescript-checker-options-with-stryker-options.js';

const resolveTestResource = path.resolve.bind(
  path,
  path.dirname(fileURLToPath(import.meta.url)),
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
  'project-references',
) as unknown as typeof path.resolve;

describe('Typescript checker on a project with project references', () => {
  let sut: TypescriptChecker;

  beforeEach(() => {
    (testInjector.options as TypescriptCheckerOptionsWithStrykerOptions).typescriptChecker = { prioritizePerformanceOverAccuracy: true };
    testInjector.options.tsconfigFile = resolveTestResource('tsconfig.root.json');
    sut = testInjector.injector.injectFunction(createTypescriptChecker);
    return sut.init();
  });

  it('should not write output to disk', () => {
    expect(fs.existsSync(resolveTestResource('dist')), 'Output was written to disk!').false;
  });

  it('should be able to validate a mutant', async () => {
    const mutant = createMutant('job.ts', 'Starting job', 'stryker was here');
    const expectedResult: Record<string, CheckResult> = { [mutant.id]: { status: CheckStatus.Passed } };
    const actualResult = await sut.check([mutant]);
    expect(actualResult).deep.eq(expectedResult);
  });

  it('should allow unused local variables (override options)', async () => {
    const mutant = createMutant('job.ts', 'toUpperCase(logText)', 'toUpperCase("")');
    const expectedResult: Record<string, CheckResult> = { [mutant.id]: { status: CheckStatus.Passed } };
    const actual = await sut.check([mutant]);
    expect(actual).deep.eq(expectedResult);
  });

  it('should create multiple groups if reference between project', async () => {
    const mutantInSourceProject = createMutant('job.ts', 'Starting job', '', '42');
    const mutantInProjectWithReference = createMutant('text.ts', 'toUpperCase()', 'toLowerCase()', '43');
    const mutantOutsideOfReference = createMutant('math.ts', 'array.length', '1', '44');
    const result = await sut.group([mutantInSourceProject, mutantInProjectWithReference, mutantOutsideOfReference]);
    expect(result).to.have.lengthOf(2);
  });
});

const fileContents = Object.freeze({
  ['index.ts']: fs.readFileSync(resolveTestResource('src', 'index.ts'), 'utf8'),
  ['job.ts']: fs.readFileSync(resolveTestResource('src', 'job.ts'), 'utf8'),
  ['math.ts']: fs.readFileSync(resolveTestResource('utils', 'math.ts'), 'utf8'),
  ['text.ts']: fs.readFileSync(resolveTestResource('utils', 'text.ts'), 'utf8'),
});

function createMutant(fileName: 'index.ts' | 'job.ts' | 'math.ts' | 'text.ts', findText: string, replacement: string, id = '42', offset = 0): Mutant {
  const lines = fileContents[fileName].split('\n'); // todo fix this \n
  const lineNumber = lines.findIndex((l) => l.includes(findText));
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
