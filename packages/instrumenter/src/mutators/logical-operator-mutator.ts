import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from '.';

export class LogicalOperatorMutator implements NodeMutator {
  public name = 'LogicalOperator';

  private readonly operators: { [targetedOperator: string]: '||' | '&&' } = {
    '&&': '||',
    '||': '&&',
  };

  public mutate(path: NodePath): NodeMutation[] {
    if (types.isLogicalExpression(path.node)) {
      const mutatedOperator = this.operators[path.node.operator];
      if (mutatedOperator) {
        const replacement = types.cloneNode(path.node, false);
        replacement.operator = mutatedOperator;
        return [{ original: path.node, replacement }];
      }
    }

    return [];
  }
}
