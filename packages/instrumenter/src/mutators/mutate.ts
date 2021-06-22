import { NodePath } from '@babel/core';

import { Mutable } from '../mutant';

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
import { MutatorOptions } from './mutator-options';
import { RegexMutator } from './regex-mutator';

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
  new RegexMutator(),
];
export function* mutate(node: NodePath, { excludedMutations }: MutatorOptions): Iterable<Mutable> {
  for (const mutator of mutators) {
    for (const replacement of mutator.mutate(node)) {
      yield { original: node.node, replacement, mutatorName: mutator.name, ignoreReason: formatIgnoreReason(mutator.name) };
    }
  }

  function formatIgnoreReason(mutatorName: string): string | undefined {
    if (excludedMutations.includes(mutatorName)) {
      return `Ignored because of excluded mutation "${mutatorName}"`;
    } else {
      return undefined;
    }
  }
}
