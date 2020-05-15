import { NodePath, types } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from './node-mutator';

type Operator =
  | '+'
  | '-'
  | '/'
  | '%'
  | '*'
  | '**'
  | '&'
  | '|'
  | '>>'
  | '>>>'
  | '<<'
  | '^'
  | '=='
  | '==='
  | '!='
  | '!=='
  | 'in'
  | 'instanceof'
  | '>'
  | '<'
  | '>='
  | '<=';

export class ArithmeticOperatorMutator implements NodeMutator {
  private readonly operators: {
    [op: string]: Operator | undefined;
  } = Object.freeze({
    '+': '-',
    '-': '+',
    '*': '/',
    '/': '*',
    '%': '*',
  } as const);

  public name = 'ArithmeticOperator';

  public mutate(path: NodePath): NodeMutation[] {
    if (types.isBinaryExpression(path.node)) {
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
