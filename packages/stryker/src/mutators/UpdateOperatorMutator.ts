import { Syntax } from 'esprima';
import * as estree from 'estree';
import NodeMutator from './NodeMutator';
import { IdentifiedNode } from './IdentifiedNode';

export default class UpdateOperatorMutator implements NodeMutator {
  public name = 'UpdateOperator';
  private readonly type = Syntax.UpdateExpression;
  private readonly operators: { [targetedOperator: string]: estree.UpdateOperator } = {
    '++': '--',
    '--': '++'
  };

  public applyMutations(node: IdentifiedNode, copy: <T extends IdentifiedNode> (obj: T, deep?: boolean) => T): void | IdentifiedNode {
    if (node.type === this.type && this.operators[node.operator]) {
      const mutatedNode = copy(node);
      mutatedNode.operator = this.operators[node.operator];
      return mutatedNode;
    }
  }
}
