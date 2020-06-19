import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from '.';

export class ArrowFunctionMutator implements NodeMutator {
  public name = 'ArrowFunction';

  public mutate(path: NodePath): NodeMutation[] {
    return path.isArrowFunctionExpression() && !types.isBlockStatement(path.node.body)
      ? [{ original: path.node, replacement: types.arrowFunctionExpression([], types.identifier('undefined')) }]
      : [];
  }
}
