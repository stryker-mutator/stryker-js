import * as ts from 'typescript';
import { Mutant } from 'stryker-api/mutant';
import { Config } from 'stryker-api/config';
import { Logger, getLogger } from 'log4js';
import Mutator from './mutator/Mutator';
import BinaryExpressionMutator from './mutator/BinaryExpressionMutator';
import flatMap = require('lodash.flatmap');
import { InputFile } from 'stryker-api/core';
import { createProgram } from './helpers/tsHelpers';
import MutantCandidate from './mutator/MutantCandidate';
import MutantCandidateCompiler from './mutator/MutantCandidateCompiler';

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

  generateMutants(inputFiles: InputFile[]): Mutant[] {
    const program = createProgram(inputFiles, this.config);
    const mutantValidator = new MutantCandidateCompiler(inputFiles, this.config);
    const mutatedInputFiles = inputFiles.filter(inputFile => inputFile.mutated);
    const candidates = flatMap(mutatedInputFiles, inputFile => {
      const sourceFile = program.getSourceFile(inputFile.path);
      return this.generateMutantsForNode(sourceFile, sourceFile);
    });
    this.log.info(`Found ${candidates.length} possible mutant candidates. Making sure it results in valid typescript.`);
    const mutants = candidates.filter(_ => mutantValidator.validateMutant(_));
    this.log.info(`${mutants.length} of the ${candidates.length} mutants resulted in valid typescript.`);
    return mutants;
  }
  
  static printer = ts.createPrinter({
    removeComments: false,
    newLine: ts.NewLineKind.CarriageReturnLineFeed
  });
  private generateMutantsForNode<T extends ts.Node>(node: T, sourceFile: ts.SourceFile): MutantCandidate[] {
    const targetMutators = this.mutators.filter(mutator => mutator.guard(node));
    const candidates = flatMap(targetMutators, mutator => mutator.mutate(node, sourceFile));
    node.forEachChild(child => {
      // It is important that forEachChild does not return a true, otherwise node visiting is halted!
      candidates.push(... this.generateMutantsForNode(child, sourceFile));
    });
    return candidates;
  }
}