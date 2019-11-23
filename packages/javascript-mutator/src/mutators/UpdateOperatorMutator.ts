import * as types from '@babel/types';

import { NodeMutator } from './NodeMutator';

export default class UpdateOperatorMutator implements NodeMutator {
  public name = 'UpdateOperator';

  private readonly operators: { [targetedOperator: string]: string } = {
    '++': '--',
    '--': '++'
  };

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    const nodes: types.Node[] = [];

    if (types.isUpdateExpression(node) && this.operators[node.operator] !== undefined) {
      const mutatedNode = copy(node);
      mutatedNode.operator = this.operators[node.operator] as any;
      nodes.push(mutatedNode);
    }

    return nodes;
  }
}
