import flatMap = require('lodash.flatmap');
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import { Mutant } from 'stryker-api/mutant';
import * as ts from 'typescript';
import { getTSConfig, parseFile } from './helpers/tsHelpers';
import ArrayLiteralMutator from './mutator/ArrayLiteralMutator';
import ArrayNewExpressionMutator from './mutator/ArrayNewExpressionMutator';
import ArrowFunctionMutator from './mutator/ArrowFunctionMutator';
import BinaryExpressionMutator from './mutator/BinaryExpressionMutator';
import BlockMutator from './mutator/BlockMutator';
import BooleanSubstitutionMutator from './mutator/BooleanSubstitutionMutator';
import ConditionalExpressionMutator from './mutator/ConditionalExpressionMutator';
import DoStatementMutator from './mutator/DoStatementMutator';
import ForStatementMutator from './mutator/ForStatementMutator';
import IfStatementMutator from './mutator/IfStatementMutator';
import NodeMutator from './mutator/NodeMutator';
import ObjectLiteralMutator from './mutator/ObjectLiteralMutator';
import PrefixUnaryExpressionMutator from './mutator/PrefixUnaryExpressionMutator';
import StringLiteralMutator from './mutator/StringLiteralMutator';
import SwitchCaseMutator from './mutator/SwitchCaseMutator';
import WhileStatementMutator from './mutator/WhileStatementMutator';

export default class TypescriptMutator {

  constructor(private readonly config: Config, public mutators: NodeMutator[] = [
    new BinaryExpressionMutator(),
    new BooleanSubstitutionMutator(),
    new ArrayLiteralMutator(),
    new ArrayNewExpressionMutator(),
    new BlockMutator(),
    new ArrowFunctionMutator(),
    new IfStatementMutator(),
    new ObjectLiteralMutator(),
    new WhileStatementMutator(),
    new ForStatementMutator(),
    new DoStatementMutator(),
    new ConditionalExpressionMutator(),
    new PrefixUnaryExpressionMutator(),
    new StringLiteralMutator(),
    new SwitchCaseMutator()
  ]) { }

  public mutate(inputFiles: File[]): Mutant[] {
    const tsConfig = getTSConfig(this.config);
    const mutants = flatMap(inputFiles, inputFile => {
      const sourceFile = parseFile(inputFile, tsConfig && tsConfig.options && tsConfig.options.target);

      return this.mutateForNode(sourceFile, sourceFile);
    });

    return mutants;
  }

  private mutateForNode<T extends ts.Node>(node: T, sourceFile: ts.SourceFile): Mutant[] {
    const targetMutators = this.mutators.filter(mutator => mutator.guard(node));
    const mutants = flatMap(targetMutators, mutator => mutator.mutate(node, sourceFile));
    node.forEachChild(child => {
      // It is important that forEachChild does not return a true, otherwise node visiting is halted!
      mutants.push(...this.mutateForNode(child, sourceFile));
    });

    return mutants;
  }
}
