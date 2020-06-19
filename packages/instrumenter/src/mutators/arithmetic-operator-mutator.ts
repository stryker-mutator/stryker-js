import { NodePath, types } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from './node-mutator';

export class ArithmeticOperatorMutator implements NodeMutator {
  private readonly operators: {
    [op: string]: BinaryOperator | undefined;
  } = Object.freeze({
    '+': '-',
    '-': '+',
    '*': '/',
    '/': '*',
    '%': '*',
  } as const);

  public name = 'ArithmeticOperator';

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isBinaryExpression()) {
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
