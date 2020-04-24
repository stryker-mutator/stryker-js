import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';

import { NodeMutator } from './NodeMutator';

export default class UpdateOperatorMutator implements NodeMutator {
  public name = 'UpdateOperator';

  private readonly operators: { [targetedOperator: string]: string } = {
    '++': '--',
    '--': '++',
  };

  public mutate(node: types.Node): Array<[types.Node, types.Node | { raw: string }]> {
    return types.isUpdateExpression(node) && this.operators[node.operator] !== undefined
      ? [[node, NodeGenerator.createMutatedCloneWithProperties(node, { operator: this.operators[node.operator] as any })]]
      : [];
  }
}
