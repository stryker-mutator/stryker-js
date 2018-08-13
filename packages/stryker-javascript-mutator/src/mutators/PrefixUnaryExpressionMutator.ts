import { types } from 'babel-core';
import NodeMutator from './NodeMutator';

export default class PrefixUnaryExpressionMutator implements NodeMutator {
  name = 'PrefixUnaryExpression';

  private operators: { [targetedOperator: string]: string } = {
    '+': '-',
    '-': '+',
    '++': '--',
    '--': '++',
    '~': '',
    '!': ''
  };

  mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): void | types.Node[] {
    if ((types.isUpdateExpression(node) || types.isUnaryExpression(node)) && this.operators[node.operator] !== undefined && node.prefix) {
      let mutatedNode;
      if (this.operators[node.operator].length > 0) {
        mutatedNode = copy(node);
        mutatedNode.operator = this.operators[node.operator] as any;
      } else {
        mutatedNode = copy(node.argument);
        mutatedNode.start = node.start;
      }
      return [mutatedNode];
    }
  }
}