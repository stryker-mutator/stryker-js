import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';

import { NodeMutator } from './NodeMutator';

export default class BooleanLiteralMutator implements NodeMutator {
  public name = 'BooleanLiteral';

  private readonly unaryBooleanPrefix = '!';

  public mutate(node: types.Node): Array<[types.Node, types.Node | { raw: string }]> {
    // true -> false or false -> true
    if (types.isBooleanLiteral(node)) {
      return [[node, NodeGenerator.createMutatedCloneWithProperties(node, { value: !node.value })]];
    } else if (types.isUnaryExpression(node) && node.operator === this.unaryBooleanPrefix && node.prefix) {
      return [[node, node.argument]];
    }

    return [];
  }
}
