import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';

import { Location, Mutant } from '@stryker-mutator/api/core';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { expect } from 'chai';

import { createLintChecker } from '../../src/index.js';
import { mochaHooks } from '../setup.js';
import { LintChecker } from '../../src/eslint-checker.js';

const resolveTestResource = path.resolve.bind(
  path,
  path.dirname(fileURLToPath(import.meta.url)),
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
  'success'
) as unknown as typeof path.resolve;

describe('Lint checker success', () => {
  let sut: LintChecker;

  beforeEach(() => {
    mochaHooks.beforeEach();
    const testProjectRoot = resolveTestResource('.');
    testInjector.options.lintConfigFile = resolveTestResource('.eslintrc.cjs');
    testInjector.options.mutate = ['*.js'];
    process.chdir(testProjectRoot);
    sut = testInjector.injector.injectFunction(createLintChecker);
    return sut.init();
  });

  afterEach(mochaHooks.afterEach);

  it('should accept initialization if initial compilation has no errors', async () => {
    await expect(sut.init()).fulfilled;
  });

  it('should be able to validate a mutant that does not result in an error', async () => {
    const mutant = createMutant('say-hello.js', "'Hello, '", "''", '42');
    const expectedResult: Record<string, CheckResult> = { '42': { status: CheckStatus.Passed } };
    const actual = await sut.check([mutant]);
    expect(actual).deep.eq(expectedResult);
  });

  it('should be able to reject a mutant that does result in an error', async () => {
    const mutantId = '42';
    const mutant = createMutant('say-hello.js', "return 'Hello, ' + name;", '', mutantId);
    const actual = await sut.check([mutant]);
    expect(actual[mutantId].status).eq(CheckStatus.CompileError);
  });
});

const fileContents = Object.freeze({
  ['say-hello.js']: fs.readFileSync(resolveTestResource('src', 'say-hello.js'), 'utf8'),
});

function createMutant(fileName: keyof typeof fileContents, findText: string, replacement: string, id = '42', offset = 0): Mutant {
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
