import * as types from '@babel/types';
import { NodeMutator } from './NodeMutator';

export default class PostfixUnaryExpressionMutator implements NodeMutator {
  public name = 'PostfixUnaryExpression';

  private readonly operators: { [targetedOperator: string]: string } = {
    '++': '--',
    '--': '++'
  };

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    const nodes: types.Node[] = [];

    if (types.isUpdateExpression(node) && !node.prefix && this.operators[node.operator]) {
      const mutatedNode = copy(node);
      mutatedNode.operator = this.operators[node.operator] as any;
      nodes.push(mutatedNode);
    }

    return nodes;
  }
}
