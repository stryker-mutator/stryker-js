import { types } from 'babel-core';
import NodeMutator from './NodeMutator';

export default class PostfixUnaryExpressionMutator implements NodeMutator {
  name = 'PostfixUnaryExpression';

  private operators: { [targetedOperator: string]: string } = {
    '++': '--',
    '--': '++'
  };

  mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): void | types.Node[] {
    if (types.isUpdateExpression(node) && !node.prefix && this.operators[node.operator]) {
      let mutatedNode = copy(node);
      mutatedNode.operator = this.operators[node.operator] as any;
      return [mutatedNode];
    }
  }
}