import { Mutator, IdentifiedNode } from 'stryker-api/mutant';
import { Syntax } from 'esprima';
import * as estree from 'estree';

export default class LogicalOperatorMutator implements Mutator {
  name = 'LogicalOperator';
  private type = Syntax.LogicalExpression;
  private operators: { [targetedOperator: string]: estree.LogicalOperator } = {
    '&&': '||',
    '||': '&&'
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