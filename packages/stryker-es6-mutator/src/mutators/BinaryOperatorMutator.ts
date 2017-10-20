import { types } from 'babel-core';
import { IdentifiedNode } from '../IdentifiedNode';
import NodeMutator from './NodeMutator';

export default class BinaryOperatorMutator implements NodeMutator {
  private operators: { [targetedOperator: string]: string | string[] } = {
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

  name = 'BinaryOperator';

  mutate(node: IdentifiedNode, clone: <T extends IdentifiedNode> (node: T, deep?: boolean) => T) {
    if (types.isBinaryExpression(node)) {
      let mutatedOperators = this.operators[node.operator];
      if (mutatedOperators) {
        if (typeof mutatedOperators === 'string') {
          mutatedOperators = [mutatedOperators];
        }

        return mutatedOperators.map<IdentifiedNode>(mutatedOperator => {
          let mutatedNode = clone(node);
          mutatedNode.operator = mutatedOperator as any;
          return mutatedNode;
        });
      }
    }
    return undefined;
  }
}