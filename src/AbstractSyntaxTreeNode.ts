'use strict';

/**
 * Represents a node on the abstract syntax tree.
 * @constructor
 */
export default class AbstractSyntaxTreeNode {
  get node(): ESTree.Node {
    return this._node;
  }
  
  get parent(): AbstractSyntaxTreeNode {
    return this._parent;
  }
  
  get key(): string| number {
    return this._key;
  }

  /**
   * @param node - The actual node.
   * @param parent - The parent of the node.
   * @param key - The key of the node in the parent.
   */
  constructor(private _node: ESTree.Node, private _parent: AbstractSyntaxTreeNode, private _key: string| number) {
  }
}