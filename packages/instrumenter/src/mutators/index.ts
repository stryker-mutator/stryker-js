import { NodePath } from '@babel/core';
import { flatMap } from '@stryker-mutator/util';

import { NamedNodeMutation } from '../mutant';

import { ArithmeticOperatorMutator } from './arithmetic-operator-mutator';
import { NodeMutator } from './node-mutator';
import { BlockStatementMutator } from './block-statement-mutator';
import { ConditionalExpressionMutator } from './conditional-expression-mutator';
import { StringLiteralMutator } from './string-literal-mutator';
import { ArrayDeclarationMutator } from './array-declaration-mutator';
import { ArrowFunctionMutator } from './arrow-function-mutator';
import { BooleanLiteralMutator } from './boolean-literal-mutator';
import { EqualityOperatorMutator } from './equality-operator-mutator';
import { LogicalOperatorMutator } from './logical-operator-mutator';
import { ObjectLiteralMutator } from './object-literal-mutator';
import { UnaryOperatorMutator } from './unary-operator-mutator';
import { UpdateOperatorMutator } from './update-operator-mutator';

export * from './node-mutator';
export const mutators: NodeMutator[] = [
  new ArithmeticOperatorMutator(),
  new ArrayDeclarationMutator(),
  new ArrowFunctionMutator(),
  new BlockStatementMutator(),
  new BooleanLiteralMutator(),
  new ConditionalExpressionMutator(),
  new EqualityOperatorMutator(),
  new LogicalOperatorMutator(),
  new ObjectLiteralMutator(),
  new StringLiteralMutator(),
  new UnaryOperatorMutator(),
  new UpdateOperatorMutator(),
];
export const mutate = (node: NodePath): NamedNodeMutation[] => {
  return flatMap(mutators, (mutator) => mutator.mutate(node).map((nodeMutation) => ({ ...nodeMutation, mutatorName: mutator.name })));
};
