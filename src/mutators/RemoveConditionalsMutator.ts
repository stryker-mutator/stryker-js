import { Syntax } from 'esprima';
import { Mutator } from 'stryker-api/mutant';
import * as estree from 'estree';

type ConditionExpression = estree.DoWhileStatement | estree.IfStatement | estree.ForStatement | estree.WhileStatement | estree.ConditionalExpression;

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class RemoveConditionalsMutator implements Mutator {
  name = 'RemoveConditionals';
  private types: string[] = [Syntax.DoWhileStatement, Syntax.IfStatement, Syntax.ForStatement, Syntax.WhileStatement, Syntax.ConditionalExpression];

  constructor() { }

  applyMutations(node: estree.Node, copy: <T>(obj: T, deep?: boolean) => T): estree.Node[] | void {
    if (this.canMutate(node)) {
      let nodes: estree.Node[] = [];
      nodes.push(this.booleanLiteralNode(node.test.nodeID, false));

      if (node.type === Syntax.IfStatement || node.type === Syntax.ConditionalExpression) {
        nodes.push(this.booleanLiteralNode(node.test.nodeID, true));
      }
      return nodes;
    }
  }

  private booleanLiteralNode(nodeID: number, value: boolean): estree.SimpleLiteral {
    return {
      nodeID: nodeID,
      type: Syntax.Literal,
      value: value,
      raw: value.toString()
    };
  }

  private canMutate(node: estree.Node): node is ConditionExpression {
    return this.types.indexOf(node.type) >= 0;
  };

}
