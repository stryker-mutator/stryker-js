export class Node {
  constructor(public fileName: string, public parents: Node[] | null, public childs: Node[] | null) {}

  public getAllParentReferences(): Node[] {
    const allParentReferences: Node[] = [];
    this.parents?.forEach((parent) => {
      const innerParents = parent.getAllParentReferences();
      innerParents.forEach((node) => {
        allParentReferences.push(node);
      });
    });
    return allParentReferences;
  }
}
