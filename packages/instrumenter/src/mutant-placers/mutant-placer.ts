import { NodePath, types } from '@babel/core';

import { Mutant } from '../mutant.js';

export interface MutantPlacer<TNode extends types.Node = types.Node> {
  name: string;
  canPlace(path: NodePath): boolean;
  place(path: NodePath<TNode>, appliedMutants: Map<Mutant, TNode>): void;
}
