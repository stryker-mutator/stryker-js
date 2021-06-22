import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutator } from '.';

export class ArrowFunctionMutator implements NodeMutator {
  public name = 'ArrowFunction';

  private readonly undefinedIdentifierName = 'undefined';

  public *mutate(path: NodePath): Iterable<types.Node> {
    if (
      path.isArrowFunctionExpression() &&
      !types.isBlockStatement(path.node.body) &&
      !(types.isIdentifier(path.node.body) && path.node.body.name === this.undefinedIdentifierName)
    ) {
      yield types.arrowFunctionExpression([], types.identifier(this.undefinedIdentifierName));
    }
  }
}
