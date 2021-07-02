import { NodePath, types } from '@babel/core';

export interface NodeMutator {
  mutate(path: NodePath): Iterable<types.Node>;
  readonly name: string;
}
