import {Syntax} from 'esprima';
import {Mutator} from 'stryker-api/mutant';
import * as estree from 'estree';

type ConditionExpression = estree.DoWhileStatement | estree.IfStatement | estree.ForStatement | estree.WhileStatement | estree.ConditionalExpression;

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class RemoveConditionalsMutator implements Mutator {
  name = 'RemoveConditionals';
  private types: string[] = [Syntax.DoWhileStatement, Syntax.IfStatement, Syntax.ForStatement, Syntax.WhileStatement, Syntax.ConditionalExpression];

  constructor() { }

  applyMutations(node: estree.Node, copy: <T>(obj: T, deep?: boolean) => T): estree.Node[] {
    let nodes: estree.Node[] = [];

    if (this.canMutate(node)) {
      let mutatedFalseNode = copy(node.test);
      this.mutateTestExpression(mutatedFalseNode, false);
      //nodes.push(mutatedFalseNode);

      if (node.type === Syntax.IfStatement) {
        // let mutatedTrueNode: estree.Literal = copy(node.test);
        // this.mutateTestExpression(mutatedTrueNode, true);
        // nodes.push(mutatedTrueNode);
      }
    }

    return nodes;
  }

  private mutateTestExpression(node: estree.Expression, newValue: boolean) {
    // TODO: Implement this method
    // Change the node from an estree.Expression into an estree.Literal containing the value of `newValue`
  }

  private canMutate(node: estree.Node) : node is ConditionExpression {
    return this.types.indexOf(node.type) >= 0;
  };

  private copyNode(node: estree.Node) {
    return JSON.parse(JSON.stringify(node));
  }
}
