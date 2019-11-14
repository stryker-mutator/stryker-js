import * as types from '@babel/types';

import { NodeMutator } from './NodeMutator';

export default class UnaryOperatorMutator implements NodeMutator {
  public name = 'UnaryOperator';

  private readonly operators: { [targetedOperator: string]: string } = {
    '+': '-',
    '-': '+',
    '~': ''
  };

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    const nodes: types.Node[] = [];

    if (types.isUnaryExpression(node) && this.operators[node.operator] !== undefined && node.prefix) {
      if (this.operators[node.operator].length > 0) {
        const mutatedNode = copy(node);
        mutatedNode.operator = this.operators[node.operator] as any;
        nodes.push(mutatedNode);
      } else {
        const mutatedNode = copy(node.argument);
        mutatedNode.start = node.start;
        nodes.push(mutatedNode);
      }
    }

    return nodes;
  }
}
