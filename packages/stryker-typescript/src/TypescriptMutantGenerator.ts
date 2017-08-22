import { Logger, getLogger } from 'log4js';
import * as ts from 'typescript';
import flatMap = require('lodash.flatmap');
import { File } from 'stryker-api/core';
import { Mutant } from 'stryker-api/mutant';
import { Config } from 'stryker-api/config';
import { createProgram } from './helpers/tsHelpers';
import Mutator from './mutator/Mutator';
import BinaryExpressionMutator from './mutator/BinaryExpressionMutator';

export function filterValues<T>(array: (T | null | undefined)[]): T[] {
  return array.filter(a => a !== null && a !== undefined) as T[];
}

export default class TypescriptMutantGenerator {

  private readonly log: Logger;

  constructor(private config: Config, public mutators: Mutator[] = [
    new BinaryExpressionMutator()
  ]) {
    this.log = getLogger(TypescriptMutantGenerator.name);
  }

  generateMutants(inputFiles: File[]): Mutant[] {
    const program = createProgram(inputFiles, this.config);
    const mutatedInputFiles = inputFiles.filter(inputFile => inputFile.mutated);
    const candidates = flatMap(mutatedInputFiles, inputFile => {
      const sourceFile = program.getSourceFile(inputFile.name);
      return this.generateMutantsForNode(sourceFile, sourceFile);
    });
    return candidates;
  }

  static printer = ts.createPrinter({
    removeComments: false,
    newLine: ts.NewLineKind.CarriageReturnLineFeed
  });

  private generateMutantsForNode<T extends ts.Node>(node: T, sourceFile: ts.SourceFile): Mutant[] {
    const targetMutators = this.mutators.filter(mutator => mutator.guard(node));
    const mutants = flatMap(targetMutators, mutator => mutator.mutate(node, sourceFile));
    node.forEachChild(child => {
      // It is important that forEachChild does not return a true, otherwise node visiting is halted!
      mutants.push(... this.generateMutantsForNode(child, sourceFile));
    });
    return mutants;
  }
}