import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from '.';

export class UnaryOperatorMutator implements NodeMutator {
  public name = 'UnaryOperator';

  private readonly operators: { [targetedOperator: string]: string } = {
    '+': '-',
    '-': '+',
    '~': '',
  };

  public mutate(path: NodePath): NodeMutation[] {
    if (types.isUnaryExpression(path.node) && this.operators[path.node.operator] !== undefined && path.node.prefix) {
      return this.operators[path.node.operator].length > 0
        ? [
            {
              original: path.node,
              replacement: types.unaryExpression(this.operators[path.node.operator] as any, path.node.argument),
            },
          ]
        : [
            {
              original: path.node,
              replacement: path.node.argument,
            },
          ];
    }

    return [];
  }
}
