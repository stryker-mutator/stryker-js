import {Syntax} from 'esprima-custom';
import {Mutator} from 'stryker-api/mutant';
import * as estree from 'estree';

/**
 * Represents a mutator which can remove the content of a BlockStatement.
 */
export default class BlockStatementMutator implements Mutator {
  name = 'BlockStatement';
  constructor() { }

  applyMutations(node: estree.Node, copy: <T>(obj: T, deep?: boolean) => T): estree.Node[] {
    let nodes: estree.Node[] = [];

    if (node.type === Syntax.BlockStatement) {
      let mutatedNode = copy(node);
      mutatedNode.body = [];
      nodes.push(mutatedNode);
    }

    return nodes;
  }

}
