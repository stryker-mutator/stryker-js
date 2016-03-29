/**
 * Represents a class which can mutate parts of an Abstract Syntax Tree.
 */
interface Mutator {
  /**
   * The name of the Mutator which may be used by reporters.
   */
  name: string;
  
  /**
   * Applies the Mutator to a Node. This can result in multiple mutated Nodes.
   * @param node A FROZEN Node which could be cloned and mutated.
   * @returns An array of mutated Nodes.
   */
  applyMutations(node: ESTree.Node): ESTree.Node[];
}

export default Mutator;