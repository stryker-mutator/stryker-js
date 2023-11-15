import type { types, NodePath } from '@babel/core';
import { MutationLevel } from '@stryker-mutator/api/core';

export interface NodeMutator {
  mutate(path: NodePath, mutationOptions?: MutationLevel): Iterable<types.Node>;
  readonly name: string;
}
