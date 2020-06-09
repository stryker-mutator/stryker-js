import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';

import { NodeMutator } from './NodeMutator';

/**
 * Represents a mutator which can remove the content of a Block.
 */
export default class BlockStatementMutator implements NodeMutator {
  public name = 'BlockStatement';

  public mutate(node: types.Node): Array<[types.Node, types.Node | { raw: string }]> {
    return types.isBlockStatement(node) && node.body.length > 0
      ? [
          [node, NodeGenerator.createMutatedCloneWithProperties(node, { body: [] })], // `{}`
        ]
      : [];
  }
}
