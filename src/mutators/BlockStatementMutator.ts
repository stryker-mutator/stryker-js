import {Syntax} from 'esprima';
import {Mutator} from 'stryker-api/mutant';
import * as estree from 'estree';

/**
 * Represents a mutator which can remove the content of a BlockStatement.
 */
export default class BlockStatementMutator implements Mutator {
  name = 'BlockStatement';
  private type = Syntax.BlockStatement;

  constructor() { }

  applyMutations(node: estree.Node, copy: <T>(obj: T, deep?: boolean) => T) {
    if (node.type === Syntax.BlockStatement) {
      let mutatedNode = copy(<estree.BlockStatement>node);
      mutatedNode.body = [];
      return mutatedNode;
    }
  }
}
