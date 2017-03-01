import {Mutator} from 'stryker-api/mutant';
import {Syntax} from 'esprima';
import * as estree from 'estree';

export default class UnaryOperatorMutator implements Mutator  {
  name = 'UnaryOperator';
  private type = Syntax.UnaryExpression;
  private operators: { [targetedOperator: string]: estree.UnaryOperator } = {
      '+': '-',
      '-': '+'
  };

  applyMutations(node: estree.Node, copy: <T>(obj: T, deep?: boolean) => T): estree.Node[] {
    let nodes: estree.Node[] = [];

    if (node.type === this.type && this.operators[node.operator]) {
      let mutatedNode = copy(node);
      mutatedNode.operator = this.operators[node.operator];
      nodes.push(mutatedNode);
    }

    return nodes;
  }

}