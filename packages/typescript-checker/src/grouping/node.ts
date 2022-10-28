export class Node {
  constructor(public fileName: string, public parents: Node[], public childs: Node[]) {}

  public getAllParentReferencesIncludingSelf(allParentReferences: Set<Node> = new Set<Node>()): Set<Node> {
    allParentReferences.add(this);
    this.parents?.forEach((parent) => {
      if (!allParentReferences.has(parent)) {
        parent.getAllParentReferencesIncludingSelf(allParentReferences);
      }
    });
    return allParentReferences;
  }
}
