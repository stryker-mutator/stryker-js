import { Mutator } from 'stryker-api/mutant';
import * as estree from 'estree';

export default class MyMutator implements Mutator {
  public name: 'my-mutator';

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
  applyMutations(node: estree.Node, copy: <T extends estree.Node>(obj: T, deep?: boolean) => T): void | estree.Node | estree.Node[] {

  }
}