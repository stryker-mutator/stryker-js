import {Mutator} from 'stryker-api/mutant';
import {Syntax} from 'esprima';
import * as estree from 'estree';

export default class LogicalOperatorMutator implements Mutator  {
  name = 'LogicalOperator';
  private type = Syntax.LogicalExpression;
  private operators: { [targetedOperator: string]: estree.LogicalOperator } = {
      '&&': '||',
      '||': '&&'
  };

  applyMutations(node: estree.Node, copy: <T>(obj: T, deep?: boolean) => T): estree.Node[] {
    let nodes: estree.Node[] = [];

    if (node.type === Syntax.LogicalExpression && this.operators[node.operator]) {
      let mutatedNode = copy(node);
      mutatedNode.operator = this.operators[node.operator];
      nodes.push(mutatedNode);
    }

    return nodes;
  }

}