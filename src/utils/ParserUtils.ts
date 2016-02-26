'use strict';

import * as _ from 'lodash';
import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
import AbstractSyntaxTreeNode from '../AbstractSyntaxTreeNode';
import TypeUtils from './TypeUtils';

/**
 * Utility class for parsing and generating code.
 * @constructor
 */
export default class ParserUtils {
  private esprimaOptions = {
    comment: true,
    loc: true,
    range: true,
    tokens: true,
  };

  private escodegenOptions: escodegen.GenerateOptions = {
    comment: true,
    format: {
      preserveBlankLines: true
    }
  };
  private typeUtils = new TypeUtils();


  /**
   * Parses code to generate an Abstract Syntax Tree.
   * @function
   * @param code - The code which has to be parsed.
   * @returns {Object} The generated Abstract Syntax Tree.
   */
  public parse (code: string): any {
    this.typeUtils.expectParameterString(code, 'ParserUtils', 'code');
    if (code === '') {
      return {};
    }

    this.escodegenOptions.sourceCode = code;
    var abstractSyntaxTree = esprima.parse(code, this.esprimaOptions);
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
  public getNodesWithType (abstractSyntaxTree: any, types: string[], nodes?: AbstractSyntaxTreeNode[], parent?: AbstractSyntaxTreeNode, key?: string): AbstractSyntaxTreeNode[] {
    this.typeUtils.expectParameterObject(abstractSyntaxTree, 'Mutator', 'abstractSyntaxTree');
    this.typeUtils.expectParameterArray(types, 'Mutator', 'types');
    nodes = nodes || [];

    if (this.typeUtils.isObject(abstractSyntaxTree) && _.indexOf(types, abstractSyntaxTree.type) >= 0) {
      nodes.push(new AbstractSyntaxTreeNode(abstractSyntaxTree, parent, key));
    }

    _.forOwn(abstractSyntaxTree, (childNode, key) => {
      if (this.typeUtils.isObject(childNode)) {
        this.getNodesWithType(childNode, types, nodes, abstractSyntaxTree, key);
      } else if (this.typeUtils.isArray(childNode)) {
        _.forEach(childNode, (arrayChild, index) => {
          if (this.typeUtils.isObject(arrayChild)) {
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
  public generate (ast: ESTree.Node, originalCode?: string): string {
    this.typeUtils.expectParameterObject(ast, 'ParserUtils', 'ast');

    this.escodegenOptions.sourceCode = originalCode || this.escodegenOptions.sourceCode;

    return escodegen.generate(ast, this.escodegenOptions);
  };

}
