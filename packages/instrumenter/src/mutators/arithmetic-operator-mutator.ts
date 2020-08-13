import { NodePath, types } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from './node-mutator';

enum ArithmeticOperators {
  '+' = '-',
  '-' = '+',
  '*' = '/',
  '/' = '*',
  '%' = '*',
}

export class ArithmeticOperatorMutator implements NodeMutator {
  private readonly operators = ArithmeticOperators;

  public name = 'ArithmeticOperator';

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isBinaryExpression() && this.isSupported(path.node.operator)) {
      const mutatedOperator = this.operators[path.node.operator];
      const replacement = types.cloneNode(path.node, false);
      replacement.operator = mutatedOperator;
      return [{ original: path.node, replacement }];
    }

    return [];
  }

  private isSupported(operator: string): operator is keyof typeof ArithmeticOperators {
    return Object.keys(this.operators).includes(operator);
  }
}
