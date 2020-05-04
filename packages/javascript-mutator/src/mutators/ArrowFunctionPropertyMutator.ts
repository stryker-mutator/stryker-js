import * as types from '@babel/types';

import { NodeGenerator } from '../helpers/NodeGenerator';

import { NodeMutator } from './NodeMutator';

/**
 * Represents a mutator which can mutate an object shorthand property.
 */
export default class ArrowFunctionPropertyMutator implements NodeMutator {
  public name = 'ArrowFunctionProperty';

  public mutate(node: types.Node): Array<[types.Node, types.Node | { raw: string }]> {
    return types.isObjectPattern(node)
      ? node.properties
          .filter((prop) => types.isObjectProperty(prop) && prop.shorthand)
          .map((mutateProp) => [
            node,
            NodeGenerator.createMutatedCloneWithProperties(node, {
              properties: node.properties.filter((prop) => prop !== mutateProp),
            }),
          ])
      : [];
  }
}
