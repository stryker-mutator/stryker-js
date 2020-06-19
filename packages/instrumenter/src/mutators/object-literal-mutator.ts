import * as types from '@babel/types';
import { NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from '.';

export class ObjectLiteralMutator implements NodeMutator {
  public name = 'ObjectLiteral';

  public mutate(path: NodePath): NodeMutation[] {
    return path.isObjectExpression() && path.node.properties.length > 0 ? [{ original: path.node, replacement: types.objectExpression([]) }] : [];
  }
}
