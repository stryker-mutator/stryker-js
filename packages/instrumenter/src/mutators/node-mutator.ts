import type { types, NodePath } from '@babel/core';
import { Mutable } from '../mutant.js';

export interface NodeMutator {
  mutate(path: NodePath): Iterable<types.Node | undefined>;
  // mutate(path: NodePath): Iterable<types.Node>;

  filter?(mutablesInScope: Mutable[]): boolean;
  readonly name: string;
}
