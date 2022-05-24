/* eslint-disable */

import babel from '@babel/core';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

// todo: what to call this thing???
export const functionChainMutator: NodeMutator = {
  name: 'FunctionChain',

  *mutate(path) {
    if (!(path.isCallExpression() || path.isOptionalCallExpression())) {
      return;
    }

    const { callee } = path.node;
    if (!(types.isMemberExpression(callee) || types.isOptionalMemberExpression(callee)) || !types.isIdentifier(callee.property)) {
      return;
    }

    // todo: edge case, new container.startsWith()
    // todo: computed? optional?

    // todo: move up
    // todo: refactor
    const matches = new Map([
      ['startsWith', 'endsWith'],
      ['endsWith', 'startsWith'],
    ]);

    const newName = matches.get(callee.property.name);
    if (!newName) {
      return;
    }

    const mutatedCallee = types.isMemberExpression(callee)
      ? types.memberExpression(callee.object, types.identifier(newName), false, callee.optional)
      : types.optionalMemberExpression(callee.object, types.identifier(newName), false, callee.optional);

    yield types.isCallExpression(path.node)
      ? types.callExpression(
          mutatedCallee,
          path.node.arguments.map((argumentNode) => types.cloneNode(argumentNode, true))
        )
      : types.optionalCallExpression(
          mutatedCallee,
          path.node.arguments.map((argumentNode) => types.cloneNode(argumentNode, true)),
          path.node.optional
        );
  },
};
