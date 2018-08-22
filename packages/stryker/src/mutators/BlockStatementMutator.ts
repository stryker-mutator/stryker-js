import { Syntax } from 'esprima';
import NodeMutator from './NodeMutator';
import { IdentifiedNode } from './IdentifiedNode';

/**
 * Represents a mutator which can remove the content of a BlockStatement.
 */
export default class BlockStatementMutator implements NodeMutator {
  public name = 'BlockStatement';
  private readonly type = Syntax.BlockStatement;

  constructor() { }

  public applyMutations(node: IdentifiedNode, copy: <T extends IdentifiedNode> (obj: T, deep?: boolean) => T): void | IdentifiedNode {
    if (node.type === this.type && node.body.length > 0) {
      const mutatedNode = copy(node);
      mutatedNode.body = [];
      return mutatedNode;
    }
  }
}
