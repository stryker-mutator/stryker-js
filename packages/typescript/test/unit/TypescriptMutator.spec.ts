import * as path from 'path';
import * as fs from 'fs';
import { expect } from 'chai';
import * as ts from 'typescript';
import { File } from '@stryker-mutator/api/core';
import { TypescriptMutator, MUTATORS_TOKEN, typescriptMutatorFactory } from '../../src/TypescriptMutator';
import NodeMutator, { NodeReplacement } from '../../src/mutator/NodeMutator';
import { testInjector } from '@stryker-mutator/test-helpers';

class FunctionDeclarationMutator extends NodeMutator<ts.FunctionDeclaration> {
  public name = 'FunctionDeclarationForTest';
  public guard(node: ts.Node): node is ts.FunctionDeclaration {
    return node.kind === ts.SyntaxKind.FunctionDeclaration;
  }
  protected identifyReplacements(node: ts.FunctionDeclaration): NodeReplacement[] {
    return [
      { node, replacement: '// Function declaration removed' },
      { node, replacement: 'changedToOtherCall()' }
    ];
  }
}

class SourceFileMutator extends NodeMutator<ts.SourceFile> {
  public name = 'SourceFileForTest';
  public guard(node: ts.Node): node is ts.SourceFile {
    return node.kind === ts.SyntaxKind.SourceFile;
  }
  protected identifyReplacements(node: ts.SourceFile): NodeReplacement[] {
    return [{ node, replacement: '"stryker was here"' }];
  }
}

function createSut() {
  return testInjector.injector
    .provideValue(MUTATORS_TOKEN, [
      new SourceFileMutator(),
      new FunctionDeclarationMutator()
    ])
    .injectClass(TypescriptMutator);
}

describe('TypescriptMutator', () => {
  let sut: TypescriptMutator;

  it('should register all mutators by default', () => {
    // Arrange
    const expectedMutatorNames = fs
      .readdirSync(path.resolve(__dirname, '..', '..', 'src', 'mutator'))
      .filter(mutatorFile => path.extname(mutatorFile) === '.ts'
        && !mutatorFile.endsWith('.d.ts')
        && mutatorFile !== 'NodeMutator.ts'
        && mutatorFile !== 'index.ts')
      .map(fileName => fileName.substr(0, fileName.length - 'Mutator.ts'.length));

    // Act
    const actualMutators = testInjector.injector.injectFunction(typescriptMutatorFactory).mutators.map(m => m.name);

    // Assert
    expect(expectedMutatorNames).length.greaterThan(2); // sanity check
    expectedMutatorNames.forEach(mutatorName => expect(actualMutators).includes(mutatorName));
  });

  describe('using 2 mutators', () => {

    let file1: File;
    let file2: File;

    beforeEach(() => {
      sut = createSut();
      file1 = new File(
        'file1.ts',
        `function add(n...: number[]) {
            return n.sum();
          }
          const a = add(1, 3, 4, 5);`);
      file2 = new File(
        'file2.ts',
        `function subtract(n...: numbers[]){
          return n[0] - n.slice(1).sum();
        }
        const b = subtract(10, 3, 4);`);
    });

    it('should deliver 6 mutants', () => {
      const mutants = sut.mutate([
        file1,
        file2
      ]);
      expect(mutants.filter(mutant => mutant.mutatorName === 'SourceFileForTest')).lengthOf(2);
      expect(mutants.filter(mutant => mutant.mutatorName === 'FunctionDeclarationForTest')).lengthOf(4);
    });

  });
});
