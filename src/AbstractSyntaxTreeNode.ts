'use strict';

import TypeUtils from './utils/TypeUtils';
import BaseTestRunner from './testrunners/BaseTestRunner';

/**
 * Represents a node on the abstract syntax tree.
 * @constructor
 */
export default class AbstractSyntaxTreeNode {

  private _typeUtils = new TypeUtils();

  /**
   * @param node - The actual node.
   * @param parent - The parent of the node.
   * @param key - The key of the node in the parent.
   */
  constructor(private node: ESTree.Node, private parent: AbstractSyntaxTreeNode, private key: string| number) {
  }

  /**
   * Gets the node.
   * @function
   * @returns {Object} The node.
   */
  getNode() {
    return this.node;
  };

  /**
   * Gets the parent of the node.
   * @function
   * @returns The parent of the node.
   */
  getParent() {
    return this.parent;
  };

  /**
   * Gets the key of the node in the parent.
   * @function
   * @returns {Number|String} The key, which is a Number if the parent is an Array or a String if the parent is an Object..
   */
  getKey() {
    return this.key;
  };
}