import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from '.';

enum LogicalOperators {
  '&&' = '||',
  '||' = '&&',
}

export class LogicalOperatorMutator implements NodeMutator {
  public name = 'LogicalOperator';

  private readonly operators = LogicalOperators;

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isLogicalExpression() && this.isSupported(path.node.operator)) {
      const mutatedOperator = this.operators[path.node.operator];

      const replacement = types.cloneNode(path.node, false);
      replacement.operator = mutatedOperator;
      return [{ original: path.node, replacement }];
    }

    return [];
  }

  private isSupported(operator: string): operator is keyof typeof LogicalOperators {
    return Object.keys(this.operators).includes(operator);
  }
}
