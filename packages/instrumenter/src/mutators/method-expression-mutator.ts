import babel from '@babel/core';

import { deepCloneNode } from '../util/syntax-helpers.js';

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
  ['min', 'max'],
  ['setDate', 'setTime'],
  ['setFullYear', 'setMonth'],
  ['setHours', 'setMinutes'],
  ['setSeconds', 'setMilliseconds'],
  ['setUTCDate', 'setTime'],
  ['setUTCFullYear', 'setUTCMonth'],
  ['setUTCHours', 'setUTCMinutes'],
  ['setUTCSeconds', 'setUTCMilliseconds'],
]);

const noReverseRemplacements = ['getUTCDate', 'setUTCDate'];

for (const [key, value] of Array.from(replacements)) {
  if (value && !noReverseRemplacements.includes(key)) {
    replacements.set(value, key);
  }
}

export const methodExpressionMutator: NodeMutator = {
  name: 'MethodExpression',

  *mutate(path) {
    if (!(path.isCallExpression() || path.isOptionalCallExpression())) {
      return;
    }

    const { callee } = path.node;
    if (
      !(
        types.isMemberExpression(callee) ||
        types.isOptionalMemberExpression(callee)
      ) ||
      !types.isIdentifier(callee.property)
    ) {
      return;
    }

    const newName = replacements.get(callee.property.name);
    if (newName === undefined) {
      return;
    }

    if (newName === null) {
      // Remove the method expression. I.e. `foo.trim()` => `foo`
      yield deepCloneNode(callee.object);
      return;
    }

    // Replace the method expression. I.e. `foo.toLowerCase()` => `foo.toUpperCase`
    const nodeArguments = path.node.arguments.map((argumentNode) =>
      deepCloneNode(argumentNode),
    );

    const mutatedCallee = types.isMemberExpression(callee)
      ? types.memberExpression(
          deepCloneNode(callee.object),
          types.identifier(newName),
          false,
          callee.optional,
        )
      : types.optionalMemberExpression(
          deepCloneNode(callee.object),
          types.identifier(newName),
          false,
          callee.optional,
        );

    yield types.isCallExpression(path.node)
      ? types.callExpression(mutatedCallee, nodeArguments)
      : types.optionalCallExpression(
          mutatedCallee,
          nodeArguments,
          path.node.optional,
        );
  },
};
