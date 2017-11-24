import { types } from 'babel-core';
import NodeMutator from './NodeMutator';

export default class BinaryExpressionMutator implements NodeMutator {
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
    '!==': '===',
    '||': '&&',
    '&&': '||'
  };

  name = 'BinaryExpression';

  mutate(node: types.Node, clone: <T extends types.Node> (node: T, deep?: boolean) => T): void | types.Node[] {
    if (types.isBinaryExpression(node)) {
      let mutatedOperators = this.operators[node.operator];
      if (mutatedOperators) {
        if (typeof mutatedOperators === 'string') {
          mutatedOperators = [mutatedOperators];
        }

        return mutatedOperators.map<types.Node>(mutatedOperator => {
          let mutatedNode = clone(node);
          mutatedNode.operator = mutatedOperator as any;
          return mutatedNode;
        });
      }
    }
  }
}