import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from '.';

export class UpdateOperatorMutator implements NodeMutator {
  public name = 'UpdateOperator';

  private readonly operators: { [targetedOperator: string]: string } = {
    '++': '--',
    '--': '++',
  };

  public mutate(path: NodePath): NodeMutation[] {
    return path.isUpdateExpression() && this.operators[path.node.operator] !== undefined
      ? [
          {
            original: path.node,
            replacement: types.updateExpression(this.operators[path.node.operator] as any, path.node.argument, path.node.prefix),
          },
        ]
      : [];
  }
}
