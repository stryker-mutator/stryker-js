import * as _ from 'lodash';
import * as esprima from 'esprima';
import * as estree from 'estree';
import { IdentifiedNode, Identified } from 'stryker-api/mutant';
const escodegen = require('escodegen');

/**
 * Utility class for parsing and generating code.
 * @constructor
 */
const esprimaOptions = {
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
export function parse(code: string): estree.Program {
  if (code === undefined) {
    throw new Error('Code parameter cannot be undefined');
  }

  const abstractSyntaxTree = esprima.parse(code, esprimaOptions);

  return abstractSyntaxTree;
};

/**
   * Parses a Node to generate code.
   * @param The Node which has to be transformed into code.
   * @returns The generated code.
   */
export function generate(node: estree.Node): string {
  return escodegen.generate(node);
};

/**
 * Returns n as T & Identified, purely syntactic.
 * @param n The estree node which is identified
 */
export function identified<T extends estree.Node>(n: T) {
  return n as T & Identified;
}



/**
 * Represents an object responsible to identify estree nodes (estree.Node).
 * Labels all nodes with a `nodeID` recursively.
 */
export class NodeIdentifier {

  private identifiedNodes: Readonly<IdentifiedNode>[] = [];

  identifyAndFreeze(program: estree.Program): Readonly<IdentifiedNode>[] {
    this.identifiedNodes = [];
    this.identifyAndFreezeRecursively(program);
    return this.identifiedNodes;
  }

  private identifyAndFreezeRecursively(maybeNode: any) {
    if (this.isNode(maybeNode)) {
      if (!this.isIdentified(maybeNode)) {
        this.identify(maybeNode);
      }
      Object.freeze(maybeNode);

      _.forOwn(maybeNode, childNode => {
        this.identifyAndFreezeRecursively(childNode);
      });
    } else if (Array.isArray(maybeNode)) {
      maybeNode.forEach(grandChild => {
        this.identifyAndFreezeRecursively(grandChild);
      });
    }
  }

  private isNode(maybeNode: any): estree.Node {
    return !_.isArray(maybeNode) && _.isObject(maybeNode) && maybeNode.type;
  }

  private isIdentified(node: estree.Node): node is IdentifiedNode {
    const n = node as IdentifiedNode;
    return _.isNumber(n.nodeID);
  }

  private identify(node: estree.Node) {
    const n = node as IdentifiedNode;
    n.nodeID = this.identifiedNodes.length;
    this.identifiedNodes.push(n);
  }
}
