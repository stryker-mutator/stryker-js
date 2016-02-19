'use strict';

var _ = require('lodash');
var esprima = require('esprima');
import * as escodegen from 'escodegen';
var AbstractSyntaxTreeNode = require('../AbstractSyntaxTreeNode');
import TypeUtils from './TypeUtils';

/**
 * Utility class for parsing and generating code.
 * @constructor
 */
export default class ParserUtils {
  private _esprimaOptions = {
    comment: true,
    loc: true,
    range: true,
    tokens: true,
  };

  private _escodegenOptions: escodegen.GenerateOptions = {
    comment: true,
    format: {
      preserveBlankLines: true
    }
  };
  private _typeUtils = new TypeUtils();


  /**
   * Parses code to generate an Abstract Syntax Tree.
   * @function
   * @param {String} code - The code which has to be parsed.
   * @returns {Object} The generated Abstract Syntax Tree.
   */
  public parse (code) {
    this._typeUtils.expectParameterString(code, 'ParserUtils', 'code');
    if (code === '') {
      return {};
    }

    this._escodegenOptions.sourceCode = code;
    var abstractSyntaxTree = esprima.parse(code, this._esprimaOptions);
    //Attaching the comments is needed to keep the comments and to allow blank lines to be preserved.
    abstractSyntaxTree = escodegen.attachComments(abstractSyntaxTree, abstractSyntaxTree.comments, abstractSyntaxTree.tokens);

    return abstractSyntaxTree;
  };

  /**
   * Finds all nodes which have one of several types in a syntax tree.
   * @function
   * @param {Object} abstractSyntaxTree - The current part of the abstract syntax tree which will be investigated.
   * @param {String[]} types - The list of types which are requested.
   * @returns {Object[]} All nodes which have one of the requested types.
   */
  public getNodesWithType (abstractSyntaxTree, types, nodes, parent, key) {
    this._typeUtils.expectParameterObject(abstractSyntaxTree, 'Mutator', 'abstractSyntaxTree');
    this._typeUtils.expectParameterArray(types, 'Mutator', 'types');
    var that = this;
    nodes = nodes || [];

    if (that._typeUtils.isObject(abstractSyntaxTree) && _.indexOf(types, abstractSyntaxTree.type) >= 0) {
      nodes.push(new AbstractSyntaxTreeNode(abstractSyntaxTree, parent, key));
    }

    _.forOwn(abstractSyntaxTree, function(childNode, key) {
      if (that._typeUtils.isObject(childNode)) {
        that.getNodesWithType(childNode, types, nodes, abstractSyntaxTree, key);
      } else if (that._typeUtils.isArray(childNode)) {
        _.forEach(childNode, function(arrayChild, index) {
          if (that._typeUtils.isObject(arrayChild)) {
            that.getNodesWithType(arrayChild, types, nodes, childNode, index);
          }
        });
      }
    });

    return nodes;
  };


  /**
   * Parses an Abstract Syntax Tree to generate code.
   * @function
   * @param {Object} ast - The Abstract Syntax Tree.
   * @param {String} [orignalCode] - The original code of the ast.
   * @returns {String} The generated code.
   */
  public generate (ast, originalCode) {
    this._typeUtils.expectParameterObject(ast, 'ParserUtils', 'ast');

    this._escodegenOptions.sourceCode = originalCode || this._escodegenOptions.sourceCode;

    return escodegen.generate(ast, this._escodegenOptions);
  };

}
