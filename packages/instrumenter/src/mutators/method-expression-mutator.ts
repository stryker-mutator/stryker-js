import babel from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

// prettier-ignore
const operators = Object.freeze({
  'charAt': { replacement: null, mutatorName: 'removeCharAt' },
  'endsWith': { replacement: 'startsWith', mutatorName: 'endsWithToStartsWith' },
  'startsWith': { replacement: 'endsWith', mutatorName: 'startsWithToEndsWith' },
  'every': { replacement: 'some', mutatorName: 'everyToSome' },
  'some': { replacement: 'every', mutatorName: 'someToEvery' },
  'filter': { replacement: null, mutatorName: 'removeFilter' },
  'reverse': { replacement: null, mutatorName: 'removeReverse' },
  'slice': { replacement: null, mutatorName: 'removeSlice' },
  'sort': { replacement: null, mutatorName: 'removeSort' },
  'substr': { replacement: null, mutatorName: 'removeSubstr' },
  'substring': { replacement: null, mutatorName: 'removeSubstring' },
  'toLocaleLowerCase': { replacement: 'toLocaleUpperCase', mutatorName: 'toLocaleLowerCaseToToLocaleUpperCase' },
  'toLocaleUpperCase': { replacement: 'toLocaleLowerCase', mutatorName: 'toLocaleUpperCaseToToLocaleLowerCase' },
  'toLowerCase': { replacement: 'toUpperCase', mutatorName: 'toLowerCaseToToUpperCase' },
  'toUpperCase': { replacement: 'toLowerCase', mutatorName: 'toUpperCaseToToLowerCase' },
  'trim': { replacement: null, mutatorName: 'removeTrim' },
  'trimEnd': { replacement: 'trimStart', mutatorName: 'trimEndToTrimStart' },
  'trimStart': { replacement: 'trimEnd', mutatorName: 'trimStartToTrimEnd' },
  'min': { replacement: 'max', mutatorName: 'minToMax' },
  'max': { replacement: 'min', mutatorName: 'maxToMin' },
});

export const methodExpressionMutator: NodeMutator = {
  name: 'MethodExpression',

  *mutate(path, operations) {
    // In case `operations` is undefined, any checks will short-circuit to true and allow the mutation

    if (!(path.isCallExpression() || path.isOptionalCallExpression())) {
      return;
    }

    const { callee } = path.node;
    if (!(types.isMemberExpression(callee) || types.isOptionalMemberExpression(callee)) || !types.isIdentifier(callee.property)) {
      return;
    }

    const mutation = operators[callee.property.name as keyof typeof operators];
    if (mutation === undefined) {
      // Function is not known in `operators`, so no mutations
      return;
    }

    if (operations !== undefined && !operations.includes(mutation.mutatorName)) {
      // Mutator is blocked by mutation level, so no replacement
      return;
    }

    // Replace the method expression. I.e. `foo.toLowerCase()` => `foo.toUpperCase`
    const nodeArguments = path.node.arguments.map((argumentNode) => deepCloneNode(argumentNode));

    let mutatedCallee = undefined;

    if (mutation.replacement != null) {
      mutatedCallee = types.isMemberExpression(callee)
        ? types.memberExpression(deepCloneNode(callee.object), types.identifier(mutation.replacement), false, callee.optional)
        : types.optionalMemberExpression(deepCloneNode(callee.object), types.identifier(mutation.replacement), false, callee.optional);
    } else if (typeof mutation.replacement == 'object' && mutation.replacement == null) {
      yield deepCloneNode(callee.object);
      return;
    }

    if (mutatedCallee != undefined) {
      yield types.isCallExpression(path.node)
        ? types.callExpression(mutatedCallee, nodeArguments)
        : types.optionalCallExpression(mutatedCallee, nodeArguments, path.node.optional);
    }
  },
};
