import path from 'path';
import fs from 'fs';

import { expect } from 'chai';
import { Location, MutantTestCoverage } from '@stryker-mutator/api/core';
import { testInjector, factory } from '@stryker-mutator/test-helpers';

import { createTypescriptChecker } from '../../src';
import { TypescriptChecker } from '../../src/typescript-checker';
import { SourceFiles } from '../../src/compilers/compiler';

const resolveTestResource = path.resolve.bind(
  path,
  __dirname,
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
  'out-file-project'
) as unknown as typeof path.resolve;

describe('Typescript checker with project outfile enabled', () => {
  let sut: TypescriptChecker;

  before(() => {
    testInjector.options.tsconfigFile = resolveTestResource('tsconfig.root.json');
    sut = testInjector.injector.injectFunction(createTypescriptChecker);
    return sut.init();
  });

  it('should create groups of size one', async () => {
    const mutants = [
      createMutantTestCoverage('src/index.ts', 'console.log(', '', '1'),
      createMutantTestCoverage('src/item.ts', 'console.log(', '', '2'),
      createMutantTestCoverage('src/todo.ts', 'console.log(', '', '3'),
    ];

    const groups = await sut.createGroups(mutants);
    expect(groups).to.have.lengthOf(3);
  });

  it('should create a correct dependency graph', async () => {
    const dependencyFiles: SourceFiles = (sut as any).sourceFiles;

    for (const file of Object.keys(dependencyFiles)) {
      if (file.includes('spec')) {
        expect(dependencyFiles.get(file)!.imports.size).to.equal(3);
      }
    }
  });
});

const fileContents = Object.freeze({
  ['src/index.ts']: fs.readFileSync(resolveTestResource('src', 'index.ts'), 'utf8'),
  ['src/item.ts']: fs.readFileSync(resolveTestResource('src', 'item.ts'), 'utf8'),
  ['src/todo.ts']: fs.readFileSync(resolveTestResource('src', 'todo.ts'), 'utf8'),
});

function createMutantTestCoverage(
  fileName: 'src/index.ts' | 'src/item.ts' | 'src/todo.ts',
  findText: string,
  replacement: string,
  id = '1',
  offset = 0
): MutantTestCoverage {
  const lines = fileContents[fileName].split('\n');
  const lineNumber = lines.findIndex((l) => l.includes(findText));
  if (lineNumber === -1) {
    throw new Error(`Cannot find ${findText} in ${fileName}`);
  }
  const textColumn = lines[lineNumber].indexOf(findText);
  const location: Location = {
    start: { line: lineNumber, column: textColumn + offset },
    end: { line: lineNumber, column: textColumn + findText.length },
  };
  return factory.mutantTestCoverage({
    fileName: resolveTestResource(fileName),
    mutatorName: 'foo-mutator',
    location,
    replacement,
    id,
  });
}
