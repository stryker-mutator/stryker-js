import * as path from 'path';
import * as fs from 'mz/fs';
import { expect } from 'chai';
import * as ts from 'typescript';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import TypescriptMutator from '../../src/TypescriptMutator';
import NodeMutator, { NodeReplacement } from '../../src/mutator/NodeMutator';

class FunctionDeclarationMutator extends NodeMutator<ts.FunctionDeclaration> {
  name = 'FunctionDeclarationForTest';
  guard(node: ts.Node): node is ts.FunctionDeclaration {
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
  name = 'SourceFileForTest';
  guard(node: ts.Node): node is ts.SourceFile {
    return node.kind === ts.SyntaxKind.SourceFile;
  }
  protected identifyReplacements(node: ts.SourceFile): NodeReplacement[] {
    return [{ node, replacement: '"stryker was here"' }];
  }
}

describe('TypescriptMutator', () => {
  let sut: TypescriptMutator;
  let config: Config;

  beforeEach(() => {
    config = new Config();
  });

  it('should register all mutators by default', () => {
    // Arrange
    const expectedMutatorNames = fs
      .readdirSync(path.resolve(__dirname, '..', '..', 'src', 'mutator'))
      .filter(mutatorFile => path.extname(mutatorFile) === '.ts'
        && !mutatorFile.endsWith('.d.ts')
        && mutatorFile !== 'NodeMutator.ts')
      .map(fileName => fileName.substr(0, fileName.length - 'Mutator.ts'.length));

    // Act
    const actualMutators = new TypescriptMutator(config).mutators.map(m => m.name);

    // Assert
    expect(expectedMutatorNames).length.greaterThan(2); // sanity check
    expectedMutatorNames.forEach(mutatorName => expect(actualMutators).includes(mutatorName));
  });

  describe('using 2 mutators', () => {

    let file1: File;
    let file2: File;

    beforeEach(() => {
      sut = new TypescriptMutator(config, [
        new FunctionDeclarationMutator(),
        new SourceFileMutator()
      ]);
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