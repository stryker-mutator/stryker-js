import * as types from '@babel/types';

import { NodeMutator } from './NodeMutator';

/**
 * Represents a mutator which can mutate RegExp literal or constructor function call
 */
export default class RegExpMutator implements NodeMutator {
  public name = 'RegExp';

  public mutate(node: types.Node): Array<[types.Node, types.Node | { raw: string }]> {
    if (types.isRegExpLiteral(node)) {
      return [[node, { raw: "new RegExp('')" }]];
    } else if ((types.isCallExpression(node) || types.isNewExpression(node)) && types.isIdentifier(node.callee) && node.callee.name === 'RegExp') {
      const args = node.arguments;
      return [
        args && args.length && !(types.isStringLiteral(args[0]) && args[0].value.length == 0)
          ? [node, { raw: "new RegExp('')" }]
          : [node, { raw: '/Hello from Stryker/' }],
      ];
    } else {
      return [];
    }
  }
}
