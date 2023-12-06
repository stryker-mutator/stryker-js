import babel from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutatorConfiguration } from '../mutation-level/mutation-level.js';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

// prettier-ignore
const operators: NodeMutatorConfiguration = {
  'charAt': { replacement: null, mutationName: 'removeCharAt' },
  'endsWith': { replacement: 'startsWith', mutationName: 'endsWithToStartsWith' },
  'startsWith': { replacement: 'endsWith', mutationName: 'startsWithToEndsWith' },
  'every': { replacement: 'some', mutationName: 'everyToSome' },
  'some': { replacement: 'every', mutationName: 'someToEvery' },
  'filter': { replacement: null, mutationName: 'removeFilter' },
  'reverse': { replacement: null, mutationName: 'removeReverse' },
  'slice': { replacement: null, mutationName: 'removeSlice' },
  'sort': { replacement: null, mutationName: 'removeSort' },
  'substr': { replacement: null, mutationName: 'removeSubstr' },
  'substring': { replacement: null, mutationName: 'removeSubstring' },
  'toLocaleLowerCase': { replacement: 'toLocaleUpperCase', mutationName: 'toLocaleLowerCaseToToLocaleUpperCase' },
  'toLocaleUpperCase': { replacement: 'toLocaleLowerCase', mutationName: 'toLocaleUpperCaseToToLocaleLowerCase' },
  'toLowerCase': { replacement: 'toUpperCase', mutationName: 'toLowerCaseToToUpperCase' },
  'toUpperCase': { replacement: 'toLowerCase', mutationName: 'toUpperCaseToToLowerCase' },
  'trim': { replacement: null, mutationName: 'removeTrim' },
  'trimEnd': { replacement: 'trimStart', mutationName: 'trimEndToTrimStart' },
  'trimStart': { replacement: 'trimEnd', mutationName: 'trimStartToTrimEnd' },
  'min': { replacement: 'max', mutationName: 'minToMax' },
  'max': { replacement: 'min', mutationName: 'maxToMin' },
};

export const methodExpressionMutator: NodeMutator = {
  name: 'MethodExpression',

  *mutate(path, levelMutations) {
    // In case `operations` is undefined, any checks will short-circuit to true and allow the mutation

    if (!(path.isCallExpression() || path.isOptionalCallExpression())) {
      return;
    }

    const { callee } = path.node;
    if (!(types.isMemberExpression(callee) || types.isOptionalMemberExpression(callee)) || !types.isIdentifier(callee.property)) {
      return;
    }

    const mutation = operators[callee.property.name];
    if (mutation === undefined) {
      // Function is not known in `operators`, so no mutations
      return;
    }

    if (levelMutations !== undefined && !levelMutations.includes(mutation.mutationName)) {
      // Mutator is blocked by mutation level, so no replacementOperator
      return;
    }

    // Replace the method expression. I.e. `foo.toLowerCase()` => `foo.toUpperCase`
    const nodeArguments = path.node.arguments.map((argumentNode) => deepCloneNode(argumentNode));

    let mutatedCallee = undefined;

    if (mutation.replacement != null) {
      mutatedCallee = types.isMemberExpression(callee)
        ? types.memberExpression(deepCloneNode(callee.object), types.identifier(mutation.replacement as string), false, callee.optional)
        : types.optionalMemberExpression(deepCloneNode(callee.object), types.identifier(mutation.replacement as string), false, callee.optional);
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
