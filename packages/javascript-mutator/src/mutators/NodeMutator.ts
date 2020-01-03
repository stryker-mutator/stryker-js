import * as types from '@babel/types';

import { NodeWithParent } from '../helpers/ParentNode';

/**
 * Represents a class which can mutate parts of an Abstract Syntax Tree.
 */
export interface NodeMutator {
  /**
   * The name of the Mutator which may be used by reporters.
   */
  name: string;

  /**
   * Applies the Mutator to a Node. This can result in one or more mutated Nodes, or null if no mutation was applied.
   * This method will be called on every node of the abstract syntax tree,
   * implementing mutators should decide themselves if they want to mutate this specific node.
   *
   * If the mutator wants to mutate the node, it should return a array of mutated nodes,
   * as an array of tuples that specify which node is replaced and
   * what it should be replaced with (may be a raw string);
   * otherwise an empty array.
   *
   * A mutated node may be based on a clone of the original node or just a brand new node.
   *
   * @param node A FROZEN Node which could be cloned and mutated.
   * @returns An array of mutations, as tuples.
   */
  mutate(node: NodeWithParent): Array<[types.Node, types.Node | { raw: string }]>;
}
