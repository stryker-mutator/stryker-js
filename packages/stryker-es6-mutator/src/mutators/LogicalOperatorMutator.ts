import { types } from 'babel-core';
import NodeMutator from './NodeMutator';

export default class LogicalOperatorMutator implements NodeMutator {
  name = 'LogicalOperator';

  private operators: { [targetedOperator: string]: string } = {
    '&&': '||',
    '||': '&&'
  };

  mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): void | types.Node[] {
    if (types.isLogicalExpression(node) && this.operators[node.operator]) {
      let mutatedNode = copy(node);
      mutatedNode.operator = this.operators[node.operator] as any;
      return [mutatedNode];
    }
  }
}