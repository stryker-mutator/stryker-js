import path from 'path';
import fs from 'fs';
import os from 'os';

import { fileURLToPath } from 'url';

import { expect } from 'chai';
import { Location, Mutant } from '@stryker-mutator/api/core';
import { testInjector, factory } from '@stryker-mutator/test-helpers';

import { createTypescriptChecker } from '../../src/index.js';
import { TypeScriptCheckerOptionsWithStrykerOptions } from '../../src/typescript-checker-options-with-stryker-options.js';

const resolveTestResource = path.resolve.bind(
  path,
  path.dirname(fileURLToPath(import.meta.url)),
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
  'project-with-ts-buildinfo'
) as unknown as typeof path.resolve;

describe('project-with-ts-buildinfo', () => {
  it('should load project on init', async () => {
    (testInjector.options as TypeScriptCheckerOptionsWithStrykerOptions).typeScriptChecker.strategy = 'grouping';
    testInjector.options.tsconfigFile = resolveTestResource('tsconfig.json');
    const sut = testInjector.injector.injectFunction(createTypescriptChecker);
    const group = await sut.group([createMutant('src/index.ts', '', '')]);
    expect(group).lengthOf(1);
  });
});

const fileContents = Object.freeze({
  ['src/index.ts']: fs.readFileSync(resolveTestResource('src', 'index.ts'), 'utf8'),
});

function createMutant(fileName: 'src/index.ts', findText: string, replacement: string, id = '42', offset = 0): Mutant {
  const lines = fileContents[fileName].split(os.EOL);
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
