import type { types, NodePath } from '@babel/core';

export interface NodeMutator {
  mutate(path: NodePath, operations: string[] | undefined): Iterable<types.Node>;
  readonly name: string;
}
