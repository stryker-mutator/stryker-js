import babel from '@babel/core';

import { MethodExpression } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

export const methodExpressionMutator: NodeMutator<MethodExpression> = {
  name: 'MethodExpression',

  operators: {
    charAt: { replacement: null, mutationName: 'CharAtMethodCallRemoval' },
    endsWith: { replacement: 'startsWith', mutationName: 'EndsWithMethodCallNegation' },
    startsWith: { replacement: 'endsWith', mutationName: 'StartsWithMethodCallNegation' },
    every: { replacement: 'some', mutationName: 'EveryMethodCallNegation' },
    some: { replacement: 'every', mutationName: 'SomeMethodCallNegation' },
    filter: { replacement: null, mutationName: 'FilterMethodCallRemoval' },
    reverse: { replacement: null, mutationName: 'ReverseMethodCallRemoval' },
    slice: { replacement: null, mutationName: 'SliceMethodCallRemoval' },
    sort: { replacement: null, mutationName: 'SortMethodCallRemoval' },
    substr: { replacement: null, mutationName: 'SubstrMethodCallRemoval' },
    substring: { replacement: null, mutationName: 'SubstringMethodCallRemoval' },
    toLocaleLowerCase: { replacement: 'toLocaleUpperCase', mutationName: 'ToLocaleLowerCaseMethodCallNegation' },
    toLocaleUpperCase: { replacement: 'toLocaleLowerCase', mutationName: 'ToLocaleUpperCaseMethodCallNegation' },
    toLowerCase: { replacement: 'toUpperCase', mutationName: 'ToLowerCaseMethodCallNegation' },
    toUpperCase: { replacement: 'toLowerCase', mutationName: 'ToUpperCaseMethodCallNegation' },
    trim: { replacement: null, mutationName: 'TrimMethodCallRemoval' },
    trimEnd: { replacement: 'trimStart', mutationName: 'TrimEndMethodCallNegation' },
    trimStart: { replacement: 'trimEnd', mutationName: 'TrimStartMethodCallNegation' },
    min: { replacement: 'max', mutationName: 'MinMethodCallNegation' },
    max: { replacement: 'min', mutationName: 'MaxMethodCallNegation' },
  },

  *mutate(path, levelMutations) {
    // In case `operations` is undefined, any checks will short-circuit to true and allow the mutation

    if (!(path.isCallExpression() || path.isOptionalCallExpression())) {
      return;
    }

    const { callee } = path.node;
    if (!(types.isMemberExpression(callee) || types.isOptionalMemberExpression(callee)) || !types.isIdentifier(callee.property)) {
      return;
    }

    const mutation = this.operators[callee.property.name];
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
