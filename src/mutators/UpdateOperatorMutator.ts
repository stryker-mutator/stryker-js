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

  applyMutations(node: estree.Node, copy: <T>(obj: T, deep?: boolean) => T):  void | estree.Node | estree.Node[] {
    if (node.type === this.type && this.operators[node.operator]) {
      let mutatedNode = copy(node);
      mutatedNode.operator = this.operators[node.operator];
      return mutatedNode;
    }
  }
}