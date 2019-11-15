import * as types from '@babel/types';

import { NodeMutator } from './NodeMutator';

export default class BinaryExpressionMutator implements NodeMutator {
  private readonly operators: { [targetedOperator: string]: string | string[] } = {
    '!=': '==',
    '!==': '===',
    '%': '*',
    '&&': '||',
    '*': '/',
    '+': '-',
    '-': '+',
    '/': '*',
    '<': ['<=', '>='],
    '<=': ['<', '>'],
    '==': '!=',
    '===': '!==',
    '>': ['>=', '<='],
    '>=': ['>', '<'],
    '||': '&&'
  };

  public name = 'BinaryExpression';

  public mutate(node: types.Node, clone: <T extends types.Node>(node: T, deep?: boolean) => T): types.Node[] {
    if (types.isBinaryExpression(node) || types.isLogicalExpression(node)) {
      let mutatedOperators = this.operators[node.operator];
      if (mutatedOperators) {
        if (typeof mutatedOperators === 'string') {
          mutatedOperators = [mutatedOperators];
        }

        return mutatedOperators.map<types.Node>(mutatedOperator => {
          const mutatedNode = clone(node);
          mutatedNode.operator = mutatedOperator as any;
          return mutatedNode;
        });
      }
    }

    return [];
  }
}
