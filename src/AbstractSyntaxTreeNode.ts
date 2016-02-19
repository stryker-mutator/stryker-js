'use strict';

import TypeUtils from './utils/TypeUtils';

/**
 * Represents a node on the abstract syntax tree.
 * @constructor
 * @param {Object} node - The actual node.
 * @param {Object|Array} parent - The parent of the node.
 * @param {Number|String} [key] - The key of the node in the parent.
 */
function AbstractSyntaxTreeNode(node, parent, key) {
  this._typeUtils = new TypeUtils();
  this._typeUtils.expectParameterObject(node, 'BaseTestRunner', 'node');

  this._node = node;
  this._parent = parent;
  this._key = key;
}

/**
 * Gets the node.
 * @function
 * @returns {Object} The node.
 */
AbstractSyntaxTreeNode.prototype.getNode = function() {
  return this._node;
};

/**
 * Gets the parent of the node.
 * @function
 * @returns {Object|Array} The parent of the node.
 */
AbstractSyntaxTreeNode.prototype.getParent = function() {
  return this._parent;
};

/**
 * Gets the key of the node in the parent.
 * @function
 * @returns {Number|String} The key, which is a Number if the parent is an Array or a String if the parent is an Object..
 */
AbstractSyntaxTreeNode.prototype.getKey = function() {
  return this._key;
};

module.exports = AbstractSyntaxTreeNode;
