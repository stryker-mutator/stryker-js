'use strict';

import * as _ from 'lodash';
import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

/**
 * Utility class for parsing and generating code.
 * @constructor
 */
var esprimaOptions = {
  comment: true,
  loc: true,
  range: true,
  tokens: true,
};

/**
 * Parses code to generate an Abstract Syntax Tree.
 * @function
 * @param code - The code which has to be parsed.
 * @returns {Object} The generated Abstract Syntax Tree.
 */
export function parse(code: string): any {
  if(code === undefined){
    throw new Error('Code parameter cannot be undefined');
  }
  if (code === '') {
    return {};
  }

  var abstractSyntaxTree = esprima.parse(code, esprimaOptions);
  //Attaching the comments is needed to keep the comments and to allow blank lines to be preserved.
  abstractSyntaxTree = escodegen.attachComments(abstractSyntaxTree, abstractSyntaxTree.comments, abstractSyntaxTree.tokens);

  return abstractSyntaxTree;
};

/**
 * Finds all nodes which have one of several types in a syntax tree.
 * @function
 * @param abstractSyntaxTree - The current part of the abstract syntax tree which will be investigated.
 * @param  types - The list of types which are requested.
 * @returns  All nodes which have one of the requested types.
 */
export function getNodesWithType(abstractSyntaxTree: any, types: string[], nodes?: any[], key?: string): any[] {
  nodes = nodes || [];

  if (abstractSyntaxTree instanceof Object && !(abstractSyntaxTree instanceof Array) && _.indexOf(types, abstractSyntaxTree.type) >= 0) {
    nodes.push(abstractSyntaxTree);
  }

  _.forOwn(abstractSyntaxTree, (childNode, key) => {
    if (childNode instanceof Object && !(childNode instanceof Array)) {
      getNodesWithType(childNode, types, nodes, key);
    } else if (childNode instanceof Array) {
      _.forEach(childNode, (arrayChild, index) => {
        if (arrayChild instanceof Object && !(arrayChild instanceof Array)) {
          getNodesWithType(arrayChild, types, nodes, index);
        }
      });
    }
  });

  return nodes;
};
