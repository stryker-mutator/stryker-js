import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';

import { NodeMutator } from './NodeMutator';

/**
 * Represents a mutator which can mutate an object shorthand property.
 */
export default class ObjectShorthandPropertyMutator implements NodeMutator {
  public name = 'ObjectShorthandProperty';

  public mutate(node: types.Node): Array<[types.Node, types.Node | { raw: string }]> {
    return types.isObjectExpression(node)
      ? node.properties
          .filter((prop) => types.isObjectProperty(prop) && prop.shorthand)
          .map((mutateProp) => [
            node,
            NodeGenerator.createMutatedCloneWithProperties(node, { properties: node.properties.filter((prop) => prop !== mutateProp) }),
          ])
      : [];
  }
}
