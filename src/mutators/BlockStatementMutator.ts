import {Syntax} from 'esprima';
import {Mutator, MutatorFactory} from '../api/mutant';

/**
 * Represents a mutator which can remove the content of a BlockStatement.
 */
export default class BlockStatementMutator implements Mutator {
  name = 'BlockStatement';
  types = [Syntax.BlockStatement];

  constructor() { }

  applyMutations(node: ESTree.Node, deepCopy: (obj: any) => any): ESTree.Node[] {
    let nodes: ESTree.Node[] = [];

    if (this.canMutate(node)) {
      let mutatedNode: ESTree.BlockStatement = deepCopy(node);
      mutatedNode.body = [];
      nodes.push(mutatedNode);
    }

    return nodes;
  }

  private canMutate(node: ESTree.Node) {
    return !!(node && this.types.indexOf(node.type) >= 0);
  };
}

MutatorFactory.instance().register('BlockStatement', BlockStatementMutator);
