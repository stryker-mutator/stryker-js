import babel from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

export const floorDivisionMutator: NodeMutator = {
  name: 'FloorDivision',

  *mutate(path) {
    // Forward: a % b → Math.floor(a / b)
    // We emit only Math.floor (not also Math.trunc) because the two differ only
    // for negative operands, making a second forward mutant near-redundant noise.
    // The reverse direction accepts both Math.floor and Math.trunc so that
    // either idiom in the source can be mutated back to %.
    if (path.isBinaryExpression() && path.node.operator === '%') {
      const left = deepCloneNode(path.node.left);
      const right = deepCloneNode(path.node.right);
      yield types.callExpression(
        types.memberExpression(
          types.identifier('Math'),
          types.identifier('floor'),
        ),
        [types.binaryExpression('/', left, right)],
      );
      return;
    }

    // Reverse: Math.floor(x / y) or Math.trunc(x / y) → x % y
    if (!path.isCallExpression()) {
      return;
    }

    const { callee, arguments: args } = path.node;

    // Must be a non-computed member expression: Math.floor or Math.trunc
    if (
      !types.isMemberExpression(callee) ||
      callee.computed ||
      !types.isIdentifier(callee.object, { name: 'Math' }) ||
      !types.isIdentifier(callee.property)
    ) {
      return;
    }

    const methodName = callee.property.name;
    if (methodName !== 'floor' && methodName !== 'trunc') {
      return;
    }

    // Must have exactly one argument that is a BinaryExpression with '/'
    if (args.length !== 1) {
      return;
    }

    const arg = args[0];
    if (!types.isBinaryExpression(arg) || arg.operator !== '/') {
      return;
    }

    const left = deepCloneNode(arg.left);
    const right = deepCloneNode(arg.right);
    yield types.binaryExpression('%', left, right);
  },
};
