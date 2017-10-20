import { types } from 'babel-core';
import NodeMutator from './NodeMutator';
import { IdentifiedNode } from '../IdentifiedNode';

/**
 * Represents a mutator which can remove the content of a BlockStatement.
 */
export default class BlockStatementMutator implements NodeMutator {
  name = 'BlockStatement';

  mutate(node: IdentifiedNode, copy: <T extends IdentifiedNode>(obj: T, deep?: boolean) => T): void | IdentifiedNode[] {
    if (types.isBlockStatement(node) && node.body.length > 0) {
      let mutatedNode = copy(node);
      mutatedNode.body = [];
      return [mutatedNode];
    }
  }
}