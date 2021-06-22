import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutator } from '.';

enum UpdateOperators {
  '++' = '--',
  '--' = '++',
}

export class UpdateOperatorMutator implements NodeMutator {
  public name = 'UpdateOperator';

  private readonly operators = UpdateOperators;

  public *mutate(path: NodePath): Iterable<types.Node> {
    if (path.isUpdateExpression()) {
      yield types.updateExpression(this.operators[path.node.operator], path.node.argument, path.node.prefix);
    }
  }
}
