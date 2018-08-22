import { Syntax } from 'esprima';
import * as estree from 'estree';
import NodeMutator from './NodeMutator';
import { IdentifiedNode } from './IdentifiedNode';

export default class UnaryOperatorMutator implements NodeMutator {
  public name = 'UnaryOperator';
  private readonly type = Syntax.UnaryExpression;
  private readonly operators: { [targetedOperator: string]: estree.UnaryOperator } = {
    '+': '-',
    '-': '+'
  };

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
