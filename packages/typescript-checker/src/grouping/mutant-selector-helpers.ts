import { Mutant } from '@stryker-mutator/api/src/core';

import { toPosixFileName } from '../tsconfig-helpers.js';

import { Node } from './node.js';

export class MutantSelectorHelpers {
  constructor(private readonly mutants: Mutant[], private readonly nodes: Node[]) {};

  public getNewMutant(): Mutant | null {
    const mutant = this.mutants[0];
    this.mutants.splice(0, 1);
    return mutant;
  }
}

export function findNode(fileName: string, nodes: Node[]): Node | null {
  for (const node of nodes) {
    if (node.fileName === toPosixFileName(fileName)) return node;
  }

  return null;
}
