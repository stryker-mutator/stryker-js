'use strict';

var _ = require('lodash');
var esprima = require('esprima');
import * as escodegen from 'escodegen';
import AbstractSyntaxTreeNode from '../AbstractSyntaxTreeNode';
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
   * @param code - The code which has to be parsed.
   * @returns {Object} The generated Abstract Syntax Tree.
   */
  public parse (code: string): any {
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
   * @param abstractSyntaxTree - The current part of the abstract syntax tree which will be investigated.
   * @param  types - The list of types which are requested.
   * @returns  All nodes which have one of the requested types.
   */
  public getNodesWithType (abstractSyntaxTree, types: string[], nodes?: AbstractSyntaxTreeNode[], parent?, key?): AbstractSyntaxTreeNode[] {
    this._typeUtils.expectParameterObject(abstractSyntaxTree, 'Mutator', 'abstractSyntaxTree');
    this._typeUtils.expectParameterArray(types, 'Mutator', 'types');
    nodes = nodes || [];

    if (this._typeUtils.isObject(abstractSyntaxTree) && _.indexOf(types, abstractSyntaxTree.type) >= 0) {
      nodes.push(new AbstractSyntaxTreeNode(abstractSyntaxTree, parent, key));
    }

    _.forOwn(abstractSyntaxTree, (childNode, key) => {
      if (this._typeUtils.isObject(childNode)) {
        this.getNodesWithType(childNode, types, nodes, abstractSyntaxTree, key);
      } else if (this._typeUtils.isArray(childNode)) {
        _.forEach(childNode, (arrayChild, index) => {
          if (this._typeUtils.isObject(arrayChild)) {
            this.getNodesWithType(arrayChild, types, nodes, childNode, index);
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
   * @param orignalCode - The original code of the ast.
   * @returns The generated code.
   */
  public generate (ast, originalCode: string): string {
    this._typeUtils.expectParameterObject(ast, 'ParserUtils', 'ast');

    this._escodegenOptions.sourceCode = originalCode || this._escodegenOptions.sourceCode;

    return escodegen.generate(ast, this._escodegenOptions);
  };

}
