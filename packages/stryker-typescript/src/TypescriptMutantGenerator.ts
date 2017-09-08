import * as ts from 'typescript';
import flatMap = require('lodash.flatmap');
import { File } from 'stryker-api/core';
import { Mutant } from 'stryker-api/mutant';
import { Config } from 'stryker-api/config';
import { createProgram } from './helpers/tsHelpers';
import Mutator from './mutator/Mutator';
import BinaryExpressionMutator from './mutator/BinaryExpressionMutator';
import BooleanSubstitutionMutator from './mutator/BooleanSubstitutionMutator';
import UnaryNotMutator from './mutator/UnaryNotMutator';

export default class TypescriptMutantGenerator {

  constructor(private config: Config, public mutators: Mutator[] = [
    new BinaryExpressionMutator(),
    new BooleanSubstitutionMutator(),
    new UnaryNotMutator()
  ]) { }

  generateMutants(inputFiles: File[]): Mutant[] {
    const program = createProgram(inputFiles, this.config);
    const mutatedInputFiles = inputFiles.filter(inputFile => inputFile.mutated);
    const mutants = flatMap(mutatedInputFiles, inputFile => {
      const sourceFile = program.getSourceFile(inputFile.name);
      return this.generateMutantsForNode(sourceFile, sourceFile);
    });
    return mutants;
  }

  static printer = ts.createPrinter({
    removeComments: false,
    newLine: ts.NewLineKind.CarriageReturnLineFeed
  });

  private generateMutantsForNode<T extends ts.Node>(node: T, sourceFile: ts.SourceFile): Mutant[] {
    const targetMutators = this.mutators.filter(mutator => mutator.guard(node));
    const mutants = flatMap(targetMutators, mutator => mutator.generateMutants(node, sourceFile));
    node.forEachChild(child => {
      // It is important that forEachChild does not return a true, otherwise node visiting is halted!
      mutants.push(... this.generateMutantsForNode(child, sourceFile));
    });
    return mutants;
  }
}