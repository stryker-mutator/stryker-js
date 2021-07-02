import { types } from '@babel/core';

import { NodeMutator } from '.';

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
export const optionalChainingMutator: NodeMutator = {
  name: 'OptionalChaining',

  *mutate(path) {
    if (path.isOptionalMemberExpression() && path.node.optional) {
      yield types.optionalMemberExpression(
        types.cloneNode(path.node.object, true),
        types.cloneNode(path.node.property, true),
        path.node.computed,
        /*optional*/ false
      );
    }
    if (path.isOptionalCallExpression() && path.node.optional) {
      yield types.optionalCallExpression(
        types.cloneNode(path.node.callee, true),
        path.node.arguments.map((arg) => types.cloneNode(arg, true)),
        /*optional*/ false
      );
    }
  },
};
