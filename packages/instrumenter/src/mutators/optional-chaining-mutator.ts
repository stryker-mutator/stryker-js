import { NodePath, types } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from './node-mutator';

export class OptionalChainingMutator implements NodeMutator {
  public readonly name = 'OptionalChaining';

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isOptionalMemberExpression()) {
      return [{ original: path.node, replacement: types.memberExpression(path.node.object, path.node.property, path.node.computed, false) }];
    }
    if (path.isOptionalCallExpression()) {
      return [{ original: path.node, replacement: types.callExpression(path.node.callee, path.node.arguments) }];
    }
    return [];
  }
}
