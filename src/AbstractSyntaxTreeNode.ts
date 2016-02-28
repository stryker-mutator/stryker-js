'use strict';

import BaseTestRunner from './testrunners/BaseTestRunner';

/**
 * Represents a node on the abstract syntax tree.
 * @constructor
 */
export default class AbstractSyntaxTreeNode {
  private _node: ESTree.Node;
  private _parent: AbstractSyntaxTreeNode;
  private _key: string| number;

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
  constructor(node: ESTree.Node, parent: AbstractSyntaxTreeNode, key: string| number) {
    this._node = node;
    this._parent = parent;
    this._key = key;
  }
}