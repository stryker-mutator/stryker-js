import type { types, NodePath } from '@babel/core';

import { NodeMutatorConfiguration } from '../mutation-level/mutation-level.js';

export interface NodeMutator {
  mutate(path: NodePath, levelMutations: string[] | undefined): Iterable<types.Node>;
  readonly name: string;
  readonly operators?: NodeMutatorConfiguration;
}
