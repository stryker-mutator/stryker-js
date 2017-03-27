import * as _ from 'lodash';
import * as esprima from 'esprima';
import * as estree from 'estree';
const escodegen = require('escodegen');

/**
 * Utility class for parsing and generating code.
 * @constructor
 */
const esprimaOptions = {
  comment: true,
  loc: true,
  sourceType: 'module',
  range: true,
  tokens: true
};

/**
 * Parses code to generate an Abstract Syntax Tree.
 * @function
 * @param code - The code which has to be parsed.
 * @returns {Object} The generated Abstract Syntax Tree.
 */
export function parse(code: string): estree.Program {
  if (code === undefined) {
    throw new Error('Code parameter cannot be undefined');
  }

  const abstractSyntaxTree = esprima.parse(code, esprimaOptions);

  return abstractSyntaxTree;
};

/**
 * Finds all nodes which have a 'type' property and freezes them.
 * @function
 * @param abstractSyntaxTree - The current part of the abstract syntax tree which will be investigated.
 * @returns  All nodes with a type.
 */
export function collectFrozenNodes(abstractSyntaxTree: estree.Node, nodes?: estree.Node[]): estree.Node[] {
  nodes = nodes || [];

  if (!_.isArray(abstractSyntaxTree) && _.isObject(abstractSyntaxTree) && abstractSyntaxTree.type && _.isUndefined(abstractSyntaxTree.nodeID)) {
    abstractSyntaxTree.nodeID = nodes.length;
    nodes.push(abstractSyntaxTree);
  }

  Object.freeze(abstractSyntaxTree);

  _.forOwn(abstractSyntaxTree, (childNode, i) => {
    if (childNode instanceof Object && !(childNode instanceof Array)) {
      collectFrozenNodes(childNode, nodes);
    } else if (childNode instanceof Array) {
      _.forEach(childNode, (arrayChild) => {
        if (arrayChild instanceof Object && !(arrayChild instanceof Array)) {
          collectFrozenNodes(arrayChild, nodes);
        }
      });
    }
  });

  return nodes;
};

/**
   * Parses a Node to generate code.
   * @param The Node which has to be transformed into code.
   * @returns The generated code.
   */
export function generate(node: estree.Node): string {
  return escodegen.generate(node);
};
