import { NodePath } from '@babel/core';

import { Mutant } from '../mutant';

export type MutantPlacer = (node: NodePath, mutants: Mutant[]) => boolean;
