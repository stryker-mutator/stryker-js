import * as types from '@babel/types';
import { NodeMutator } from './NodeMutator';

/**
 * Represents a mutator which can remove the content of a Block.
 */
export default class BlockMutator implements NodeMutator {
  public name = 'Block';

  public mutate(node: types.Node, copy: <T extends types.Node>(obj: T, deep?: boolean) => T): types.Node[] {
    if (types.isBlockStatement(node) && node.body.length > 0) {
      const mutatedNode = copy(node);
      mutatedNode.body = [];
      return [mutatedNode];
    }
    return [];
  }
}
