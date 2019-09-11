import * as types from '@babel/types';
import { NodeMutator } from './NodeMutator';

/**
 * Represents a mutator which can remove the content of an array's elements.
 */
export default class ArrayLiteralMutator implements NodeMutator {
  public name = 'ArrayLiteral';

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    if (types.isArrayExpression(node) && node.elements.length > 0) {
      const mutatedNode = copy(node);
      mutatedNode.elements = [];
      return [mutatedNode];
    }

    return [];
  }
}
