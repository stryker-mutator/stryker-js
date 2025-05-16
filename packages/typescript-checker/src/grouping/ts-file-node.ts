import { Mutant } from '@stryker-mutator/api/core';

import { toPosixFileName } from '../tsconfig-helpers.js';

// This class exist so we can have a two way dependency graph.
// the two way dependency graph is used to search for mutants related to typescript errors
export class TSFileNode {
  constructor(
    public fileName: string,
    public parents: TSFileNode[],
    public children: TSFileNode[],
  ) {}

  public getAllParentReferencesIncludingSelf(
    allParentReferences: Set<TSFileNode> = new Set<TSFileNode>(),
  ): Set<TSFileNode> {
    allParentReferences.add(this);
    this.parents.forEach((parent) => {
      if (!allParentReferences.has(parent)) {
        parent.getAllParentReferencesIncludingSelf(allParentReferences);
      }
    });
    return allParentReferences;
  }

  public getAllChildReferencesIncludingSelf(
    allChildReferences: Set<TSFileNode> = new Set<TSFileNode>(),
  ): Set<TSFileNode> {
    allChildReferences.add(this);
    this.children.forEach((child) => {
      if (!allChildReferences.has(child)) {
        child.getAllChildReferencesIncludingSelf(allChildReferences);
      }
    });
    return allChildReferences;
  }

  public getMutantsWithReferenceToChildrenOrSelf(
    mutants: Mutant[],
    nodesChecked: string[] = [],
  ): Mutant[] {
    if (nodesChecked.includes(this.fileName)) {
      return [];
    }

    nodesChecked.push(this.fileName);

    const relatedMutants = mutants.filter(
      (m) => toPosixFileName(m.fileName) == this.fileName,
    );
    const childResult = this.children.flatMap((c) =>
      c.getMutantsWithReferenceToChildrenOrSelf(mutants, nodesChecked),
    );
    return [...relatedMutants, ...childResult];
  }
}
