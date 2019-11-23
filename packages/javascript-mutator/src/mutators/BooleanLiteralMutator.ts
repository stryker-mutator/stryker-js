import * as types from '@babel/types';

import { NodeMutator } from './NodeMutator';

export default class BooleanLiteralMutator implements NodeMutator {
  public name = 'BooleanLiteral';

  private readonly unaryBooleanPrefix = '!';

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    const nodes: types.Node[] = [];

    // true -> false or false -> true
    if (types.isBooleanLiteral(node)) {
      const mutatedNode = copy(node);
      mutatedNode.value = !mutatedNode.value;
      nodes.push(mutatedNode);
    } else if (types.isUnaryExpression(node) && node.operator === this.unaryBooleanPrefix && node.prefix) {
      const mutatedNode = copy(node.argument);
      mutatedNode.start = node.start;
      nodes.push(mutatedNode);
    }

    return nodes;
  }
}
