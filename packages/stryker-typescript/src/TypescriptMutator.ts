import * as ts from 'typescript';
import flatMap = require('lodash.flatmap');
import { File } from 'stryker-api/core';
import { Mutant } from 'stryker-api/mutant';
import { Config } from 'stryker-api/config';
import { createProgram } from './helpers/tsHelpers';
import NodeMutator from './mutator/NodeMutator';
import BinaryExpressionMutator from './mutator/BinaryExpressionMutator';
import BooleanSubstitutionMutator from './mutator/BooleanSubstitutionMutator';
import UnaryNotMutator from './mutator/UnaryNotMutator';
import ArrayLiteralMutator from './mutator/ArrayLiteralMutator';
import ArrayNewExpressionMutator from './mutator/ArrayNewExpressionMutator';
import BlockMutator from './mutator/BlockMutator';
import IfStatementMutator from './mutator/IfStatementMutator';
import WhileStatementMutator from './mutator/WhileStatementMutator';
import ForStatementMutator from './mutator/ForStatementMutator';
import DoStatementMutator from './mutator/DoStatementMutator';
import ConditionalExpressionMutator from './mutator/ConditionalExpressionMutator';
import PrefixUnaryExpressionMutator from './mutator/PrefixUnaryExpressionMutator';
import ArrowFunctionMutator from './mutator/ArrowFunctionMutator';

export default class TypescriptMutator {

  constructor(private config: Config, public mutators: NodeMutator[] = [
    new BinaryExpressionMutator(),
    new BooleanSubstitutionMutator(),
    new UnaryNotMutator(),
    new ArrayLiteralMutator(),
    new ArrayNewExpressionMutator(),
    new BlockMutator(),
    new ArrowFunctionMutator(),
    new IfStatementMutator(),
    new WhileStatementMutator(),
    new ForStatementMutator(),
    new DoStatementMutator(),
    new ConditionalExpressionMutator(),
    new PrefixUnaryExpressionMutator()
  ]) { }

  mutate(inputFiles: File[]): Mutant[] {
    const program = createProgram(inputFiles, this.config);
    const mutatedInputFiles = inputFiles.filter(inputFile => inputFile.mutated);
    const mutants = flatMap(mutatedInputFiles, inputFile => {
      const sourceFile = program.getSourceFile(inputFile.name);
      return this.mutateForNode(sourceFile, sourceFile);
    });
    return mutants;
  }

  private mutateForNode<T extends ts.Node>(node: T, sourceFile: ts.SourceFile): Mutant[] {
    const targetMutators = this.mutators.filter(mutator => mutator.guard(node));
    const mutants = flatMap(targetMutators, mutator => mutator.mutate(node, sourceFile));
    node.forEachChild(child => {
      // It is important that forEachChild does not return a true, otherwise node visiting is halted!
      mutants.push(... this.mutateForNode(child, sourceFile));
    });
    return mutants;
  }
}