import type { types, NodePath } from '@babel/core';

import { NodeMutatorConfiguration, MutationLevel } from '../mutation-level/mutation-level.js';

export interface NodeMutator<T extends keyof MutationLevel> {
  mutate(path: NodePath, levelMutations: string[] | undefined): Iterable<types.Node>;
  readonly name: string;
  operators: NodeMutatorConfiguration<T>;
}
