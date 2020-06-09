import * as types from '@babel/types';

import { NodeMutator } from './NodeMutator';

/**
 * Represents a mutator which can remove the content of an array's elements.
 */
export default class ArrayDeclarationMutator implements NodeMutator {
  public name = 'ArrayDeclaration';

  public mutate(node: types.Node): Array<[types.Node, types.Node | { raw: string }]> {
    if (types.isArrayExpression(node)) {
      return [
        // replace [...]
        node.elements.length
          ? [node, { raw: '[]' }] // raw string here
          : [node, { raw: '["Stryker was here"]' }],
      ];
    } else if ((types.isCallExpression(node) || types.isNewExpression(node)) && types.isIdentifier(node.callee) && node.callee.name === 'Array') {
      const newPrefix = types.isNewExpression(node) ? 'new ' : '';
      const mutatedCallArgs = node.arguments && node.arguments.length ? '' : '[]';
      return [[node, { raw: `${newPrefix}Array(${mutatedCallArgs})` }]];
    } else {
      return [];
    }
  }
}
