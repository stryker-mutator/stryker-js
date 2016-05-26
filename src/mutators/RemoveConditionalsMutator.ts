import {Syntax} from 'esprima';
import {Mutator} from '../api/mutant';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class RemoveConditionalsMutator implements Mutator {
  name = 'RemoveConditionals';
  private types = [Syntax.DoWhileStatement, Syntax.IfStatement, Syntax.ForStatement, Syntax.WhileStatement];

  constructor() { }

  applyMutations(node: ESTree.Node, copy: (obj: any, deep?: boolean) => any): ESTree.Node[] {
    let nodes: ESTree.Node[] = [];

    if (this.canMutate(node)) {
      let mutatedFalseNode: ESTree.Literal = copy((<ESTree.ConditionalExpression>node).test);
      this.mutateTestExpression(mutatedFalseNode, false);
      nodes.push(mutatedFalseNode);

      if (node.type === Syntax.IfStatement) {
        let mutatedTrueNode: ESTree.Literal = copy((<ESTree.ConditionalExpression>node).test);
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
