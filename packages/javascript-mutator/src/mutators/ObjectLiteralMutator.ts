import * as types from '@babel/types';

import { NodeMutator } from './NodeMutator';

/**
 * Represents a mutator which can remove the content of a Object.
 */
export default class ObjectLiteralMutator implements NodeMutator {
  public name = 'ObjectLiteral';

  public mutate(node: types.Node): Array<[types.Node, types.Node | { raw: string }]> {
    return types.isObjectExpression(node) && node.properties.length > 0
      ? [[node, { raw: '{}' }]] // raw string replacement
      : [];
  }
}
