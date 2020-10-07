import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from '.';

enum UpdateOperators {
  '++' = '--',
  '--' = '++',
}

export class UpdateOperatorMutator implements NodeMutator {
  public name = 'UpdateOperator';

  private readonly operators = UpdateOperators;

  public mutate(path: NodePath): NodeMutation[] {
    return path.isUpdateExpression()
      ? [
          {
            original: path.node,
            replacement: types.updateExpression(this.operators[path.node.operator], path.node.argument, path.node.prefix),
          },
        ]
      : [];
  }
}
