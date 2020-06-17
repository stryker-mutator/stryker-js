import { NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

export interface NodeMutator {
  mutate(path: NodePath): NodeMutation[];
  readonly name: string;
}
