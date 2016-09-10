import {Syntax} from 'esprima';
import {Mutator} from 'stryker-api/mutant';
import * as estree from 'stryker-api/estree';

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class RemoveConditionalsMutator implements Mutator {
  name = 'RemoveConditionals';
  private types = [Syntax.DoWhileStatement, Syntax.IfStatement, Syntax.ForStatement, Syntax.WhileStatement];

  constructor() { }

  applyMutations(node: estree.Node, copy: (obj: any, deep?: boolean) => any): estree.Node[] {
    let nodes: estree.Node[] = [];

    if (this.canMutate(node)) {
      let mutatedFalseNode: estree.Literal = copy((<estree.ConditionalExpression>node).test);
      this.mutateTestExpression(mutatedFalseNode, false);
      nodes.push(mutatedFalseNode);

      if (node.type === Syntax.IfStatement) {
        let mutatedTrueNode: estree.Literal = copy((<estree.ConditionalExpression>node).test);
        this.mutateTestExpression(mutatedTrueNode, true);
        nodes.push(mutatedTrueNode);
      }
    }

    return nodes;
  }

  private mutateTestExpression(node: estree.Literal, newValue: boolean) {
    node.value = newValue;
  }

  private canMutate(node: estree.Node) {
    return !!(node && this.types.indexOf(node.type) >= 0);
  };

  private copyNode(node: estree.Node) {
    return JSON.parse(JSON.stringify(node));
  }
}
