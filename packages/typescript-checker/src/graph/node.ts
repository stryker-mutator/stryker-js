export class Node {
  constructor(public fileName: string, public parents: Node[], public childs: Node[]) {}

  public GetAllParentReferences(): Node[] {
    return [];
  }
}
