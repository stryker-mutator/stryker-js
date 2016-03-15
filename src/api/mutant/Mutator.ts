
interface Mutator {
  
  name: string;
  
  applyMutations(node: ESTree.Node): ESTree.Node[];
}

export default Mutator;