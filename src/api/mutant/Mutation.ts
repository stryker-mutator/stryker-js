
interface Mutation {
  
  name: string;
  
  nodeTypes: string[];
  
  canMutate(node: ESTree.Node): boolean;
  
  applyMutations(copy: () => ESTree.Node): ESTree.Node[];
}

export default Mutation;