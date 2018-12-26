import { Syntax } from 'esprima';
import * as estree from 'estree';
import { IdentifiedNode } from './IdentifiedNode';
import NodeMutator from './NodeMutator';

export default class BinaryOperatorMutator implements NodeMutator {
  public name = 'BinaryOperator';
  private readonly operators: { [targetedOperator: string]: estree.BinaryOperator | estree.BinaryOperator[] } = {
    '!=': '==',
    '!==': '===',
    '%': '*',
    '*': '/',
    '+': '-',
    '-': '+',
    '/': '*',
    '<': ['<=', '>='],
    '<=': ['<', '>'],
    '==': '!=',
    '===': '!==',
    '>': ['>=', '<='],
    '>=': ['>', '<']
  };
  private readonly type = Syntax.BinaryExpression;

  public applyMutations(node: IdentifiedNode, copy: <T extends IdentifiedNode> (obj: T, deep?: boolean) => T): IdentifiedNode[] {
    const nodes: IdentifiedNode[] = [];

    if (node.type === this.type && this.operators[node.operator]) {
      const binaryNode = node;
      let mutatedOperators = this.operators[node.operator];
      if (typeof mutatedOperators === 'string') {
        mutatedOperators = [mutatedOperators];
      }
      mutatedOperators.forEach(operator => {
        const mutatedNode = copy(binaryNode);
        mutatedNode.operator = operator;
        nodes.push(mutatedNode);
      });
    }

    return nodes;
  }
}
