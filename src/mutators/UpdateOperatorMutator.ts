import {Mutator} from 'stryker-api/mutant';
import {Syntax} from 'esprima';
import * as estree from 'estree';

export default class UpdateOperatorMutator implements Mutator  {
  name = 'UpdateOperator';
  private type = Syntax.UpdateExpression;
  private operators: { [targetedOperator: string]: estree.UpdateOperator } = {
      '++': '--',
      '--': '++'
  };

  applyMutations(node: estree.Node, copy: (obj: any, deep?: boolean) => any): estree.Node[] {
    let nodes: estree.Node[] = [];

    if (node.type === Syntax.UpdateExpression && this.operators[node.operator]) {
      let mutatedNode: estree.UpdateExpression = copy(node);
      mutatedNode.operator = this.operators[(<estree.UpdateExpression>node).operator];
      nodes.push(mutatedNode);
    }

    return nodes;
  }

}