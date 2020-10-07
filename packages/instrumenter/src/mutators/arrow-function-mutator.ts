import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from '.';

export class ArrowFunctionMutator implements NodeMutator {
  public name = 'ArrowFunction';

  private readonly undefinedIdentifierName = 'undefined';

  public mutate(path: NodePath): NodeMutation[] {
    return path.isArrowFunctionExpression() &&
      !types.isBlockStatement(path.node.body) &&
      !(types.isIdentifier(path.node.body) && path.node.body.name === this.undefinedIdentifierName)
      ? [{ original: path.node, replacement: types.arrowFunctionExpression([], types.identifier(this.undefinedIdentifierName)) }]
      : [];
  }
}
