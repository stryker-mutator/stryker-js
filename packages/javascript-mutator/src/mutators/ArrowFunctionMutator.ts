import * as types from '@babel/types';

import { NodeMutator } from './NodeMutator';

/**
 * Represents a mutator which can remove the content of a Object.
 */
export default class ArrowFunctionMutator implements NodeMutator {
  public name = 'ArrowFunction';

  public mutate(node: types.Node): Array<[types.Node, types.Node | { raw: string }]> {
    return types.isArrowFunctionExpression(node) && !types.isBlockStatement(node.body)
      ? [[node, { raw: '() => undefined' }]] // raw string replacement
      : [];
  }
}
