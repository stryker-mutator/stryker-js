import { Syntax } from 'esprima';
import * as estree from 'estree';
import NodeMutator from './NodeMutator';
import { IdentifiedNode } from './IdentifiedNode';

export default class UnaryOperatorMutator implements NodeMutator {
  name = 'UnaryOperator';
  private type = Syntax.UnaryExpression;
  private operators: { [targetedOperator: string]: estree.UnaryOperator } = {
    '+': '-',
    '-': '+'
  };

  applyMutations(node: IdentifiedNode, copy: <T extends IdentifiedNode> (obj: T, deep?: boolean) => T): IdentifiedNode[] {
    let nodes: IdentifiedNode[] = [];

    if (node.type === this.type && this.operators[node.operator]) {
      let mutatedNode = copy(node);
      mutatedNode.operator = this.operators[node.operator];
      nodes.push(mutatedNode);
    }

    return nodes;
  }

}