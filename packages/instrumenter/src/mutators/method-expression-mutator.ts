import babel from '@babel/core';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

const replacements = new Map([
  ['charAt', null],
  ['endsWith', 'startsWith'],
  ['every', 'some'],
  ['filter', null],
  ['reverse', null],
  ['slice', null],
  ['sort', null],
  ['substr', null],
  ['substring', null],
  ['toLocaleLowerCase', 'toLocaleUpperCase'],
  ['toLowerCase', 'toUpperCase'],
  ['trim', null],
  ['trimEnd', 'trimStart'],
]);

for (const [key, value] of Array.from(replacements)) {
  replacements.set(key, value);
}

export const methodExpressionMutator: NodeMutator = {
  name: 'MethodExpression',

  *mutate(path) {
    if (!(path.isCallExpression() || path.isOptionalCallExpression()) || path.parent) {
      return;
    }

    const { callee } = path.node;
    if (!(types.isMemberExpression(callee) || types.isOptionalMemberExpression(callee)) || !types.isIdentifier(callee.property)) {
      return;
    }

    const newName = replacements.get(callee.property.name);
    if (newName === undefined) {
      return;
    }

    if (newName === null) {
      yield types.cloneNode(callee.object, true);
      return;
    }

    const nodeArguments = path.node.arguments.map((argumentNode) => types.cloneNode(argumentNode, true));

    const mutatedCallee = types.isMemberExpression(callee)
      ? types.memberExpression(callee.object, types.identifier(newName), false, callee.optional)
      : types.optionalMemberExpression(callee.object, types.identifier(newName), false, callee.optional);

    yield types.isCallExpression(path.node)
      ? types.callExpression(mutatedCallee, nodeArguments)
      : types.optionalCallExpression(mutatedCallee, nodeArguments, path.node.optional);
  },
};
