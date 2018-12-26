import { Syntax } from 'esprima';
import * as estree from 'estree';
import { IdentifiedNode } from './IdentifiedNode';
import NodeMutator from './NodeMutator';

export default class LogicalOperatorMutator implements NodeMutator {
  public name = 'LogicalOperator';
  private readonly operators: { [targetedOperator: string]: estree.LogicalOperator } = {
    '&&': '||',
    '||': '&&'
  };
  private readonly type = Syntax.LogicalExpression;

  public applyMutations(node: IdentifiedNode, copy: <T extends IdentifiedNode> (obj: T, deep?: boolean) => T): IdentifiedNode[] {
    const nodes: IdentifiedNode[] = [];

    if (node.type === this.type && this.operators[node.operator]) {
      const mutatedNode = copy(node);
      mutatedNode.operator = this.operators[node.operator];
      nodes.push(mutatedNode);
    }

    return nodes;
  }

}
