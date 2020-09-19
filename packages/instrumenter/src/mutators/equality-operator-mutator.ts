import { types, NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';
import { BinaryOperator } from '../util';

import { NodeMutator } from './node-mutator';

const enum EqualityOperators {
  '<',
  '<=',
  '>',
  '>=',
  '==',
  '!=',
  '===',
  '!==',
}

export class EqualityOperatorMutator implements NodeMutator {
  private readonly operators = {
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
    if (path.isBinaryExpression() && this.isSupported(path.node.operator)) {
      const mutatedOperators: BinaryOperator[] = this.operators[path.node.operator];

      return mutatedOperators.map((mutatedOperator) => {
        const replacement = types.cloneNode(path.node, false) as types.BinaryExpression;
        replacement.operator = mutatedOperator;

        return {
          original: path.node,
          replacement,
        };
      });
    }

    return [];
  }

  private isSupported(operator: string): operator is keyof EqualityOperators {
    return Object.keys(this.operators).includes(operator);
  }
}
