import { NodePath } from '@babel/core';
import * as types from '@babel/types';

import { Mutant } from '../mutant';

export type MutantPlacer = (node: NodePath, mutants: Mutant[]) => types.Node | undefined;
