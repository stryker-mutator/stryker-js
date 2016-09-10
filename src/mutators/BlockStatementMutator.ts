import {Syntax} from 'esprima';
import {Mutator} from 'stryker-api/mutant';
import * as estree from 'stryker-api/estree';

/**
 * Represents a mutator which can remove the content of a BlockStatement.
 */
export default class BlockStatementMutator implements Mutator {
  name = 'BlockStatement';
  private types = [Syntax.BlockStatement];

  constructor() { }

  applyMutations(node: estree.Node, copy: (obj: any, deep?: boolean) => any): estree.Node[] {
    let nodes: estree.Node[] = [];

    if (this.canMutate(node)) {
      let mutatedNode: estree.BlockStatement = copy(node);
      mutatedNode.body = [];
      nodes.push(mutatedNode);
    }

    return nodes;
  }

  private canMutate(node: estree.Node) {
    return !!(node && this.types.indexOf(node.type) >= 0);
  };
}
