import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from '.';

enum UnaryOperator {
  '+' = '-',
  '-' = '+',
  '~' = '',
}

export class UnaryOperatorMutator implements NodeMutator {
  public name = 'UnaryOperator';

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isUnaryExpression() && this.isSupported(path.node.operator) && path.node.prefix) {
      const mutatedOperator = UnaryOperator[path.node.operator];
      const replacement = mutatedOperator.length
        ? types.unaryExpression(mutatedOperator as '-' | '+', path.node.argument)
        : types.cloneNode(path.node.argument, false);

      return [
        {
          original: path.node,
          replacement,
        },
      ];
    }

    return [];
  }

  private isSupported(operator: string): operator is keyof typeof UnaryOperator {
    return Object.keys(UnaryOperator).includes(operator);
  }
}
