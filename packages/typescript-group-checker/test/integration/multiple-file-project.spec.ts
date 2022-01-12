import path from 'path';
import fs from 'fs';
import os from 'os';

import { expect } from 'chai';
import { Location, Mutant, MutantTestCoverage } from '@stryker-mutator/api/core';
import { CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { testInjector, factory } from '@stryker-mutator/test-helpers';

import { createTypescriptChecker } from '../../src';
import { TypescriptChecker } from '../../src/typescript-group-checker';

const resolveTestResource = path.resolve.bind(
  path,
  __dirname,
  '..' /* integration */,
  '..' /* test */,
  '..' /* dist */,
  'testResources',
  'multiple-file-project'
) as unknown as typeof path.resolve;

describe('Typescript checker on a project with multiple files', () => {
  let sut: TypescriptChecker;

  before(() => {
    testInjector.options.tsconfigFile = resolveTestResource('tsconfig.root.json');
    sut = testInjector.injector.injectFunction(createTypescriptChecker);
    return sut.init();
  });

  it('should create groups in order of size', async () => {
    const mutants = [
      createMutantTestCoverage('src/todo-list.ts', 'TodoList.allTodos.push(newItem)', 'newItem? 42: 43', '2'),
      createMutantTestCoverage('src/item.ts', 'return this.name;', '', '3'),
      createMutantTestCoverage('src/todo.ts', 'this.description;', 'sdfsdf', '1'),
    ];

    const groups = await sut.createGroups(mutants);
    expect(groups).to.have.lengthOf(2);
    expect(groups?.[0]).to.have.lengthOf(2);
    expect(groups?.[1]).to.have.lengthOf(1);
  });

  it('should validate two mutants with compile error in wrong file', async () => {
    const mutants = [
      createMutantTestCoverage('src/item.ts', 'private name: string', 'private name:  number', '1'),
      createMutantTestCoverage('src/todo.ts', 'this.description;', '""', '2'),
    ];

    const result = await sut.check(mutants);

    expect(result).to.have.lengthOf(2);
    expect(result?.[0].checkResult.status).to.equal('compileError');
    expect(result?.[1].checkResult.status).to.equal('passed');
  });
});

const fileContents = Object.freeze({
  ['src/todo.ts']: fs.readFileSync(resolveTestResource('src', 'todo.ts'), 'utf8'),
  ['src/todo-list.ts']: fs.readFileSync(resolveTestResource('src', 'todo-list.ts'), 'utf8'),
  ['src/item.ts']: fs.readFileSync(resolveTestResource('src', 'item.ts'), 'utf8'),
});

function createMutantTestCoverage(
  fileName: 'src/item.ts' | 'src/todo-list.ts' | 'src/todo.ts',
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
