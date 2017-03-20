import { IdentifiedNode } from './IdentifiedNode';

/**
 * Represents a class which can mutate parts of an Abstract Syntax Tree.
 */
interface Mutator {
  /**
   * The name of the Mutator which may be used by reporters.
   */
  name: string;
  
  /**
   * Applies the Mutator to a Node. This can result in one or more mutated Nodes, or null if no mutation was applied.
   * This method will be called on every node of the abstract syntax tree,
   * implementing mutators should decide themselves if they want to mutate this specific node.
   * If the mutator wants to mutate the node, it should return a clone of the node with mutations,
   * otherwise null. 
   * @param node A FROZEN Node which could be cloned and mutated.
   * @param copy A function to create a copy of an object.
   * @returns An array of mutated Nodes.
   */
  applyMutations(node: IdentifiedNode, copy: <T extends IdentifiedNode> (obj: T, deep?: boolean) => T): void | IdentifiedNode | IdentifiedNode[];
}

export default Mutator;