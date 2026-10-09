import type { types, NodePath } from '@babel/core';
import { Mutable } from '../mutant.js';

export interface NodeMutatorContext {
  /** Script source was an expression */
  isExpressionContext: boolean;
}

export interface NodeMutator {
  mutate(
    path: NodePath,
    mutateContext: NodeMutatorContext,
  ): Iterable<types.Node>;
  filter?(mutantsInScope: Mutable[]): boolean;
  readonly name: string;
}
