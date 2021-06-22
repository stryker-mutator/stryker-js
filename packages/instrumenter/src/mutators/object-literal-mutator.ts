import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutator } from '.';

export class ObjectLiteralMutator implements NodeMutator {
  public name = 'ObjectLiteral';

  public *mutate(path: NodePath): Iterable<types.Node> {
    if (path.isObjectExpression() && path.node.properties.length > 0) {
      yield types.objectExpression([]);
    }
  }
}
