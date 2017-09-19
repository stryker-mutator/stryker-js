import { Syntax } from 'esprima';
import * as estree from 'estree';
import NodeMutator from './NodeMutator';
import { IdentifiedNode } from './IdentifiedNode';

export default class BinaryOperatorMutator implements NodeMutator {
  name = 'BinaryOperator';
  private type = Syntax.BinaryExpression;
  private operators: { [targetedOperator: string]: estree.BinaryOperator | estree.BinaryOperator[] } = {
    '+': '-',
    '-': '+',
    '*': '/',
    '/': '*',
    '%': '*',
    '<': ['<=', '>='],
    '<=': ['<', '>'],
    '>': ['>=', '<='],
    '>=': ['>', '<'],
    '==': '!=',
    '!=': '==',
    '===': '!==',
    '!==': '==='
  };

  applyMutations(node: IdentifiedNode, copy: <T extends IdentifiedNode> (obj: T, deep?: boolean) => T): IdentifiedNode[] {
    let nodes: IdentifiedNode[] = [];

    if (node.type === this.type && this.operators[node.operator]) {
      let binaryNode = node;
      let mutatedOperators = this.operators[node.operator];
      if (typeof mutatedOperators === 'string') {
        mutatedOperators = [mutatedOperators];
      }
      mutatedOperators.forEach(operator => {
        let mutatedNode = copy(binaryNode);
        mutatedNode.operator = operator;
        nodes.push(mutatedNode);
      });
    }
    return nodes;
  }
}