'use strict';

import TypeUtils from './utils/TypeUtils';
import BaseTestRunner from './testrunners/BaseTestRunner';

/**
 * Represents a node on the abstract syntax tree.
 * @constructor
 * @param {Object} node - The actual node.
 * @param {Object|Array} parent - The parent of the node.
 * @param {Number|String} [key] - The key of the node in the parent.
 */
export default class AbstractSyntaxTreeNode {

  private _typeUtils = new TypeUtils();
  private _node;
  private _parent;
  private _key;

  constructor(node, parent, key) {

    this._node = node;
    this._parent = parent;
    this._key = key;
  }

  /**
   * Gets the node.
   * @function
   * @returns {Object} The node.
   */
  getNode() {
    return this._node;
  };

  /**
   * Gets the parent of the node.
   * @function
   * @returns {Object|Array} The parent of the node.
   */
  getParent() {
    return this._parent;
  };

  /**
   * Gets the key of the node in the parent.
   * @function
   * @returns {Number|String} The key, which is a Number if the parent is an Array or a String if the parent is an Object..
   */
  getKey() {
    return this._key;
  };
}