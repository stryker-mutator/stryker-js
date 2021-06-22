import { NodePath } from '@babel/core';
import * as types from '@babel/types';

import { Mutant } from '../mutant';

export interface MutantPlacer<TNode extends types.Node> {
  name: string;
  canPlace(path: NodePath): boolean;
  place(path: NodePath<TNode>, appliedMutants: Map<Mutant, TNode>): void;
}
