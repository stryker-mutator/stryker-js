import { NodePath, types } from '@babel/core';

import { NodeMutation } from '../mutant';

import { NodeMutator } from './node-mutator';

/**
 * Mutates optional chaining operators
 * Note that the AST for optional chaining might not be what you expect. Nodes of type `OptionalMemberExpression` can be either optional or not-optional
 *
 * For example: In this expression: `foo?.bar.baz` the `.baz` member expression is of type `OptionalMemberExpression`, because it is part of an optional chain, but is is _not_ optional.
 * Only the `.bar` optional member expression is optional.
 *
 * @example
 * foo?.bar -> foo.bar
 * foo?.[1] -> foo[1]
 * foo?.() -> foo()
 */
export class OptionalChainingMutator implements NodeMutator {
  public readonly name = 'OptionalChaining';

  public mutate(path: NodePath): NodeMutation[] {
    if (path.isOptionalMemberExpression() && path.node.optional) {
      return [
        {
          original: path.node,
          replacement: types.optionalMemberExpression(
            types.cloneNode(path.node.object, true),
            types.cloneNode(path.node.property, true),
            path.node.computed,
            /*optional*/ false
          ),
        },
      ];
    }
    if (path.isOptionalCallExpression() && path.node.optional) {
      return [
        {
          original: path.node,
          replacement: types.optionalCallExpression(
            types.cloneNode(path.node.callee, true, false),
            path.node.arguments.map((arg) => types.cloneNode(arg, true, false)),
            /*optional*/ false
          ),
        },
      ];
    }
    return [];
  }
}
