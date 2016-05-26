import {Syntax} from 'esprima';
import {Mutator} from '../api/mutant';

/**
 * Represents a mutator which can remove the content of a BlockStatement.
 */
export default class BlockStatementMutator implements Mutator {
  name = 'BlockStatement';
  private types = [Syntax.BlockStatement];

  constructor() { }

  applyMutations(node: ESTree.Node, copy: (obj: any, deep?: boolean) => any): ESTree.Node[] {
    let nodes: ESTree.Node[] = [];

    if (this.canMutate(node)) {
      let mutatedNode: ESTree.BlockStatement = copy(node);
      mutatedNode.body = [];
      nodes.push(mutatedNode);
    }

    return nodes;
  }

  private canMutate(node: ESTree.Node) {
    return !!(node && this.types.indexOf(node.type) >= 0);
  };
}
