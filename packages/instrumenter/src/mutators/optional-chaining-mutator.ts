import { types as t } from '@babel/core';

import { NodeMutator } from './index.js';

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
      const obj = t.cloneNode(path.node.object, true);
      const prop = t.cloneNode(path.node.property, true);
      if (isPartOfOptionalChain(path.node.object)) {
        yield t.optionalMemberExpression(
          obj,
          prop,
          path.node.computed,
          /*optional*/ false,
        );
      } else {
        yield t.memberExpression(obj, prop, path.node.computed);
      }
    }
    if (path.isOptionalCallExpression() && path.node.optional) {
      const args = path.node.arguments.map((arg) => t.cloneNode(arg, true));
      if (isPartOfOptionalChain(path.node.callee)) {
        yield t.optionalCallExpression(
          t.cloneNode(path.node.callee, true),
          args,
          /*optional*/ false,
        );
      } else {
        yield t.callExpression(t.cloneNode(path.node.callee, true), args);
      }
    }
  },
};

function isPartOfOptionalChain(exp: t.Expression) {
  return t.isOptionalCallExpression(exp) || t.isOptionalMemberExpression(exp);
}
