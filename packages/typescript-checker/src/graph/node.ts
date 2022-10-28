export class Node {
  constructor(public fileName: string, public parents: Node[] | null, public childs: Node[] | null) {}

  public getAllNodesToIgnore(): Node[] {
    const allParentReferences: Node[] = [this];
    this.parents?.forEach((parent) => {
      const innerParents = parent.getAllNodesToIgnore();
      innerParents.forEach((node) => {
        allParentReferences.push(node);
      });
    });
    return allParentReferences;
  }
}
