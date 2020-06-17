import { types, NodePath } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from './node-mutator';

export class BlockStatementMutator implements NodeMutator {
  public name = 'BlockStatement';

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isBlockStatement() && path.node.body.length) {
      const replacement = types.cloneNode(path.node, false);
      replacement.body = [];
      return [{ original: path.node, replacement }];
    } else {
      return [];
    }
  }
}
