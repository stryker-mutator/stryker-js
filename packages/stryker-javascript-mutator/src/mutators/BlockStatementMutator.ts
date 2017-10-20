import { types } from 'babel-core';
import NodeMutator from './NodeMutator';

/**
 * Represents a mutator which can remove the content of a BlockStatement.
 */
export default class BlockStatementMutator implements NodeMutator {
  name = 'BlockStatement';

  mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): void | types.Node[] {
    if (types.isBlockStatement(node) && node.body.length > 0) {
      let mutatedNode = copy(node);
      mutatedNode.body = [];
      return [mutatedNode];
    }
  }
}