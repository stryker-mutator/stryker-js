import { Mutant } from '@stryker-mutator/api/src/core';

export class Node {
  constructor(public fileName: string, public parents: Node[], public childs: Node[]) {}

  public getAllParentReferencesIncludingSelf(allParentReferences: Set<Node> = new Set<Node>()): Set<Node> {
    allParentReferences.add(this);
    this.parents.forEach((parent) => {
      if (!allParentReferences.has(parent)) {
        parent.getAllParentReferencesIncludingSelf(allParentReferences);
      }
    });
    return allParentReferences;
  }

  public getAllChildReferencesIncludingSelf(allChildReferences: Set<Node> = new Set<Node>()): Set<Node> {
    allChildReferences.add(this);
    this.childs.forEach((child) => {
      if (!allChildReferences.has(child)) {
        child.getAllChildReferencesIncludingSelf(allChildReferences);
      }
    });
    return allChildReferences;
  }

  public getMutantsWithReferenceToChildrenOrSelf(mutants: Mutant[], nodesChecked: string[] = []): Mutant[] {
    if (nodesChecked.includes(this.fileName)) {
      return [];
    }

    nodesChecked.push(this.fileName);

    // todo better name
    const linkedMutants = mutants.filter((m) => m.fileName == this.fileName);
    const childResult = this.childs.flatMap((c) => c.getMutantsWithReferenceToChildrenOrSelf(mutants, nodesChecked));
    return [...linkedMutants, ...childResult];
  }
}
