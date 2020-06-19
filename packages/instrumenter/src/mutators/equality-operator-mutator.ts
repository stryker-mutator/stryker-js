import { types, NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from './node-mutator';

export class EqualityOperatorMutator implements NodeMutator {
  private readonly operators: { [targetedOperator: string]: BinaryOperator[] } = {
    '<': ['<=', '>='],
    '<=': ['<', '>'],
    '>': ['>=', '<='],
    '>=': ['>', '<'],
    '==': ['!='],
    '!=': ['=='],
    '===': ['!=='],
    '!==': ['==='],
  };

  public name = 'EqualityOperator';

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isBinaryExpression()) {
      let mutatedOperators = this.operators[path.node.operator];
      if (mutatedOperators) {
        return mutatedOperators.map((mutatedOperator) => {
          const replacement = types.cloneNode(path.node, false) as types.BinaryExpression;
          replacement.operator = mutatedOperator;

          return {
            original: path.node,
            replacement,
          };
        });
      }
    }

    return [];
  }
}
