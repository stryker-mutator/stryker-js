import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutator } from '.';

enum LogicalOperatorMutationMap {
  '&&' = '||',
  '||' = '&&',
  '??' = '&&',
}

export class LogicalOperatorMutator implements NodeMutator {
  public name = 'LogicalOperator';

  public *mutate(path: NodePath): Iterable<types.Node> {
    if (path.isLogicalExpression() && this.isSupported(path.node.operator)) {
      const mutatedOperator = LogicalOperatorMutationMap[path.node.operator];

      const replacement = types.cloneNode(path.node, true);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  }

  private isSupported(operator: string): operator is LogicalOperatorMutationMap {
    return Object.keys(LogicalOperatorMutationMap).includes(operator);
  }
}
