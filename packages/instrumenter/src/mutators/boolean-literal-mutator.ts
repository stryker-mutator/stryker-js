import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutator } from '.';

export class BooleanLiteralMutator implements NodeMutator {
  public name = 'BooleanLiteral';

  private readonly unaryBooleanPrefix = '!';

  public *mutate(path: NodePath): Iterable<types.Node> {
    if (path.isBooleanLiteral()) {
      yield types.booleanLiteral(!path.node.value);
    }
    if (path.isUnaryExpression() && path.node.operator === this.unaryBooleanPrefix && path.node.prefix) {
      yield types.cloneNode(path.node.argument, true);
    }
  }
}
