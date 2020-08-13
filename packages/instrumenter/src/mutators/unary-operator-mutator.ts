import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from '.';

enum UnaryOperators {
  '+' = '-',
  '-' = '+',
  '~' = '',
}

export class UnaryOperatorMutator implements NodeMutator {
  public name = 'UnaryOperator';

  private readonly operators = UnaryOperators;

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isUnaryExpression() && this.isSupported(path.node.operator) && path.node.prefix) {
      const mutatedOperators = this.operators[path.node.operator];
      const replacement =
        mutatedOperators.length > 0 ? types.unaryExpression(mutatedOperators as any, path.node.argument) : types.cloneNode(path.node.argument, false);

      return [
        {
          original: path.node,
          replacement,
        },
      ];
    }

    return [];
  }

  private isSupported(operator: string): operator is keyof typeof UnaryOperators {
    return Object.keys(this.operators).includes(operator);
  }
}
