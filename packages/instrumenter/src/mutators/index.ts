import { NodePath } from '@babel/core';
import { flatMap } from '@stryker-mutator/util';

import { NamedNodeMutation } from '../mutant';

import { ArithmeticOperatorMutator } from './arithmetic-operator-mutator';
import { NodeMutator } from './node-mutator';
import { BlockStatementMutator } from './block-statement-mutator';
import { ConditionalExpressionMutator } from './conditional-expression-mutator';
import { StringLiteralMutator } from './string-literal-mutator';

export * from './node-mutator';
export const mutators: NodeMutator[] = [
  new ArithmeticOperatorMutator(),
  new BlockStatementMutator(),
  new ConditionalExpressionMutator(),
  new StringLiteralMutator(),
];
export const mutate = (node: NodePath): NamedNodeMutation[] => {
  return flatMap(mutators, (mutator) => mutator.mutate(node).map((nodeMutation) => ({ ...nodeMutation, mutatorName: mutator.name })));
};
