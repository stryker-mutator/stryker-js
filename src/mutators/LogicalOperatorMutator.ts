import {Mutator} from 'stryker-api/mutant';
import {Syntax} from 'esprima';
import * as estree from 'stryker-api/estree';

export default class LogicalOperatorMutator implements Mutator  {
  name = 'LogicalOperator';
  private type = Syntax.LogicalExpression;
  private operators: { [targetedOperator: string]: estree.LogicalOperator } = {
      '&&': '||',
      '||': '&&'
  };

  applyMutations(node: estree.Node, copy: (obj: any, deep?: boolean) => any): estree.Node[] {
    let nodes: estree.Node[] = [];

    if (node.type === Syntax.LogicalExpression && this.operators[(<estree.LogicalExpression>node).operator]) {
      let mutatedNode: estree.LogicalExpression = copy(node);
      mutatedNode.operator = this.operators[(<estree.LogicalExpression>node).operator];
      nodes.push(mutatedNode);
    }

    return nodes;
  }

}