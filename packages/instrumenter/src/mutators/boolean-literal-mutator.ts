import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from '.';

export class BooleanLiteralMutator implements NodeMutator {
  public name = 'BooleanLiteral';

  private readonly unaryBooleanPrefix = '!';

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isBooleanLiteral()) {
      return [{ original: path.node, replacement: types.booleanLiteral(!path.node.value) }];
    }
    if (path.isUnaryExpression() && path.node.operator === this.unaryBooleanPrefix && path.node.prefix) {
      return [{ original: path.node, replacement: types.cloneNode(path.node.argument, false) }];
    }

    return [];
  }
}
