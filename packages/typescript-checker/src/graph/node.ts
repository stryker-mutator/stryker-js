export class Node {
  constructor(public fileName: string, public parents: Node[] | null, public childs: Node[] | null) {}
}
