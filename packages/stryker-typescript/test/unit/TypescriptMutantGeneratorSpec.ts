import * as path from 'path';
import * as fs from 'mz/fs';
import { expect } from 'chai';
import * as ts from 'typescript';
import { Config } from 'stryker-api/config';
import { Mutant } from 'stryker-api/mutant';
import TypescriptMutantGenerator from '../../src/TypescriptMutantGenerator';
import Mutator from '../../src/mutator/Mutator';
import * as tsHelpers from '../../src/helpers/tsHelpers';
import { textFile } from '../helpers/producers';


class FunctionDeclarationMutator extends Mutator<ts.FunctionDeclaration> {
  name = 'FunctionDeclarationForTest';
  guard(node: ts.Node): node is ts.FunctionDeclaration {
    return node.kind === ts.SyntaxKind.FunctionDeclaration;
  }
  protected mutate(node: ts.FunctionDeclaration): Mutant[] {
    return [
      this.createMutant(node, '// Function declaration removed'),
      this.createMutant(node, 'changedToOtherCall()')
    ];
  }
}

class SourceFileMutator extends Mutator<ts.SourceFile> {
  name = 'SourceFileForTest';
  guard(node: ts.Node): node is ts.SourceFile {
    return node.kind === ts.SyntaxKind.SourceFile;
  }
  protected mutate(node: ts.SourceFile): Mutant[] {
    return [this.createMutant(node, '"stryker was here"')];
  }
}

describe('TypescriptMutantGenerator', () => {
  let sut: TypescriptMutantGenerator;
  let config: Config;
  let program: {
    getSourceFile: sinon.SinonStub;
  };

  beforeEach(() => {
    program = {
      getSourceFile: sandbox.stub()
    };
    sandbox.stub(tsHelpers, 'createProgram').returns(program);
  });

  it('should register all mutators by default', () => {
    // Arrange
    const expectedMutatorNames = fs
      .readdirSync(path.resolve(__dirname, '..', '..', 'src', 'mutator'))
      .filter(mutatorFile => path.extname(mutatorFile) === '.ts'
        && !mutatorFile.endsWith('.d.ts')
        && mutatorFile !== 'Mutator.ts')
      .map(fileName => path.parse(fileName).name);

    // Act
    const actualMutators = new TypescriptMutantGenerator(config).mutators.map(m => m.name);

    // Assert
    expect(expectedMutatorNames).length.greaterThan(2); // sanity check
    expectedMutatorNames.forEach(mutatorName => expect(actualMutators).includes(mutatorName));
  });

  describe('using 2 mutators', () => {

    beforeEach(() => {
      sut = new TypescriptMutantGenerator(config, [
        new FunctionDeclarationMutator(),
        new SourceFileMutator()
      ]);
      const file1SourceFile = ts.createSourceFile('file1.ts', `
      function add(n...: number[]) {
        return n.sum();
      }
      const a = add(1, 3, 4, 5);`, ts.ScriptTarget.ES5);
      const file2SourceFile = ts.createSourceFile('file2.ts', `
      function subtract(n...: numbers[]){
        return n[0] - n.slice(1).sum();
      }
      const b = subtract(10, 3, 4);
      `, ts.ScriptTarget.ES5);
      program.getSourceFile
        .withArgs('file1.ts').returns(file1SourceFile)
        .withArgs('file2.ts').returns(file2SourceFile);
    });

    it('should deliver 6 mutants', () => {
      const mutants = sut.generateMutants([
        textFile({ name: 'file1.ts', content: 'file 1 content' }),
        textFile({ name: 'file2.ts', content: 'file 2 content' })
      ]);
      expect(mutants.filter(mutant => mutant.mutatorName === 'SourceFileForTest')).lengthOf(2);
      expect(mutants.filter(mutant => mutant.mutatorName === 'FunctionDeclarationForTest')).lengthOf(4);
    });

  });
});