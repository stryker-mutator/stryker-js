import {Syntax} from 'esprima';
import {Mutator} from 'stryker-api/mutant';
import * as estree from 'estree';

/**
 * Represents a mutator which can remove the content of a BlockStatement.
 */
export default class BlockStatementMutator implements Mutator {
  name = 'BlockStatement';
  private types = [Syntax.BlockStatement];

  constructor() { }

  applyMutations(node: estree.Node, copy: <T>(obj: T, deep?: boolean) => T): estree.Node[] {
    let nodes: estree.Node[] = [];

    if (this.canMutate(node)) {
      let mutatedNode = copy(<estree.BlockStatement>node);
      mutatedNode.body = [];
      nodes.push(mutatedNode);
    }

    return nodes;
  }

  private canMutate(node: estree.Node) {
    return !!(node && this.types.indexOf(node.type) >= 0);
  };
}
