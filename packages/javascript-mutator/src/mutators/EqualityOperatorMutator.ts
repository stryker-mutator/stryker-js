import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';

import { NodeMutator } from './NodeMutator';

export default class EqualityOperatorMutator implements NodeMutator {
  private readonly operators: { [targetedOperator: string]: string | string[] } = {
    '<': ['<=', '>='],
    '<=': ['<', '>'],
    '>': ['>=', '<='],
    '>=': ['>', '<'],
    '==': '!=',
    '!=': '==',
    '===': '!==',
    '!==': '==='
  };

  public name = 'EqualityOperator';

  public mutate(node: types.Node): Array<[types.Node, types.Node | { raw: string }]> {
    if (types.isBinaryExpression(node)) {
      let mutatedOperators = this.operators[node.operator];
      if (mutatedOperators) {
        if (typeof mutatedOperators === 'string') {
          mutatedOperators = [mutatedOperators];
        }

        return mutatedOperators.map(mutatedOperator => [
          node,
          NodeGenerator.createMutatedCloneWithProperties(node, { operator: mutatedOperator as any })
        ]);
      }
    }

    return [];
  }
}
