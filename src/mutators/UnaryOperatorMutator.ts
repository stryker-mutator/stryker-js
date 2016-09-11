import {Mutator} from 'stryker-api/mutant';
import {Syntax} from 'esprima';
import * as estree from 'stryker-api/estree';

export default class UnaryOperatorMutator implements Mutator  {
  name = 'UnaryOperator';
  private type = Syntax.UnaryExpression;
  private operators: { [targetedOperator: string]: estree.UnaryOperator } = {
      '+': '-',
      '-': '+'
  };

  applyMutations(node: estree.Node, copy: (obj: any, deep?: boolean) => any): estree.Node[] {
    let nodes: estree.Node[] = [];

    if (node.type === Syntax.UnaryExpression && this.operators[(<estree.UnaryExpression>node).operator]) {
      let mutatedNode: estree.UnaryExpression = copy(node);
      mutatedNode.operator = this.operators[(<estree.UnaryExpression>node).operator];
      nodes.push(mutatedNode);
    }

    return nodes;
  }

}