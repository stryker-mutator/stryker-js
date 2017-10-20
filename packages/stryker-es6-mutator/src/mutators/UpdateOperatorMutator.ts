import { types } from 'babel-core';
import { IdentifiedNode } from '../IdentifiedNode';
import NodeMutator from './NodeMutator';

export default class UpdateOperatorMutator implements NodeMutator {
  name = 'UpdateOperator';

  private operators: { [targetedOperator: string]: string } = {
    '++': '--',
    '--': '++'
  };

  mutate(node: IdentifiedNode, copy: <T extends IdentifiedNode>(obj: T, deep?: boolean) => T): void | IdentifiedNode[] {
    if (types.isUpdateExpression(node) && this.operators[node.operator]) {
      let mutatedNode = copy(node);
      mutatedNode.operator = this.operators[node.operator] as any;
      return [mutatedNode];
    }
    return undefined;
  }
}