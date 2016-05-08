import {Syntax} from 'esprima';
import {Mutator} from '../api/mutant';
import MutatorFactory from '../MutatorFactory';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class RemoveConditionalsMutator implements Mutator {
  name = 'RemoveConditionals';
  types = [Syntax.DoWhileStatement, Syntax.IfStatement, Syntax.ForStatement, Syntax.WhileStatement];

  constructor() { }

  applyMutations(node: ESTree.Node, deepCopy: (obj: any) => any): ESTree.Node[] {
    let nodes: ESTree.Node[] = [];

    if (this.canMutate(node)) {
      let mutatedFalseNode: ESTree.Literal = deepCopy((<ESTree.ConditionalExpression>node).test);
      this.mutateTestExpression(mutatedFalseNode, false);
      nodes.push(mutatedFalseNode);

      if (node.type === Syntax.IfStatement) {
        let mutatedTrueNode: ESTree.Literal = deepCopy((<ESTree.ConditionalExpression>node).test);
        this.mutateTestExpression(mutatedTrueNode, true);
        nodes.push(mutatedTrueNode);
      }
    }

    return nodes;
  }

  private mutateTestExpression(node: ESTree.Literal, newValue: boolean) {
    node.type = Syntax.Literal;
    node.value = newValue;
  }

  private canMutate(node: ESTree.Node) {
    return !!(node && this.types.indexOf(node.type) >= 0);
  };

  private copyNode(node: ESTree.Node) {
    return JSON.parse(JSON.stringify(node));
  }
}

MutatorFactory.instance().register('RemoveConditionals', RemoveConditionalsMutator);
