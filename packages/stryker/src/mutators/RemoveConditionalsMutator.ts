import { Syntax } from 'esprima';
import * as estree from 'estree';
import NodeMutator from './NodeMutator';
import { IdentifiedNode, Identified } from './IdentifiedNode';

type ConditionExpression = estree.DoWhileStatement | estree.IfStatement | estree.ForStatement | estree.WhileStatement | estree.ConditionalExpression;

/**
 * Represents a mutator which can remove the conditional clause from statements.
 */
export default class RemoveConditionalsMutator implements NodeMutator {
  name = 'RemoveConditionals';
  private types: string[] = [Syntax.DoWhileStatement, Syntax.IfStatement, Syntax.ForStatement, Syntax.WhileStatement, Syntax.ConditionalExpression];

  applyMutations(node: IdentifiedNode, copy: <T extends IdentifiedNode> (obj: T, deep?: boolean) => T): IdentifiedNode[] | void {
    if (this.canMutate(node)) {
      const nodes: IdentifiedNode[] = [];

      if (node.test) {
        nodes.push(this.booleanLiteralNode((node.test as IdentifiedNode).nodeID, false));
      } else {
        const mutatedNode = copy(node);
        mutatedNode.test = this.booleanLiteralNode(-1, false);
        nodes.push(mutatedNode);
      }

      if (node.type === Syntax.IfStatement || node.type === Syntax.ConditionalExpression) {
        nodes.push(this.booleanLiteralNode((node.test as IdentifiedNode).nodeID, true));
      }
      return nodes;
    }
  }

  private booleanLiteralNode(nodeID: number, value: boolean): estree.SimpleLiteral & Identified {
    return {
      nodeID: nodeID,
      type: Syntax.Literal,
      value: value,
      raw: value.toString()
    };
  }

  private canMutate(node: estree.Node): node is ConditionExpression {
    return this.types.indexOf(node.type) >= 0;
  }

}
