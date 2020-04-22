import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';

import { NodeMutator } from './NodeMutator';

export default class UnaryOperatorMutator implements NodeMutator {
  public name = 'UnaryOperator';

  private readonly operators: { [targetedOperator: string]: string } = {
    '+': '-',
    '-': '+',
    '~': '',
  };

  public mutate(node: types.Node): Array<[types.Node, types.Node | { raw: string }]> {
    if (types.isUnaryExpression(node) && this.operators[node.operator] !== undefined && node.prefix) {
      return this.operators[node.operator].length > 0
        ? [[node, NodeGenerator.createMutatedCloneWithProperties(node, { operator: this.operators[node.operator] as any })]]
        : [[node, node.argument]];
    }

    return [];
  }
}
