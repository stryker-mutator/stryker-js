import babel from '@babel/core';

import { MethodExpression } from '@stryker-mutator/api/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './node-mutator.js';

const { types } = babel;

export const methodExpressionMutator: NodeMutator<MethodExpression> = {
  name: 'MethodExpression',

  operators: {
    charAt: { replacement: null, mutationOperator: 'CharAtMethodCallRemoval' },
    endsWith: { replacement: 'startsWith', mutationOperator: 'EndsWithMethodCallNegation' },
    startsWith: { replacement: 'endsWith', mutationOperator: 'StartsWithMethodCallNegation' },
    every: { replacement: 'some', mutationOperator: 'EveryMethodCallToSomeReplacement' },
    some: { replacement: 'every', mutationOperator: 'SomeMethodCallToEveryReplacement' },
    filter: { replacement: null, mutationOperator: 'FilterMethodCallRemoval' },
    reverse: { replacement: null, mutationOperator: 'ReverseMethodCallRemoval' },
    slice: { replacement: null, mutationOperator: 'SliceMethodCallRemoval' },
    sort: { replacement: null, mutationOperator: 'SortMethodCallRemoval' },
    substr: { replacement: null, mutationOperator: 'SubstrMethodCallRemoval' },
    substring: { replacement: null, mutationOperator: 'SubstringMethodCallRemoval' },
    toLocaleLowerCase: { replacement: 'toLocaleUpperCase', mutationOperator: 'ToLocaleLowerCaseMethodCallNegation' },
    toLocaleUpperCase: { replacement: 'toLocaleLowerCase', mutationOperator: 'ToLocaleUpperCaseMethodCallNegation' },
    toLowerCase: { replacement: 'toUpperCase', mutationOperator: 'ToLowerCaseMethodCallNegation' },
    toUpperCase: { replacement: 'toLowerCase', mutationOperator: 'ToUpperCaseMethodCallNegation' },
    trim: { replacement: null, mutationOperator: 'TrimMethodCallRemoval' },
    trimEnd: { replacement: 'trimStart', mutationOperator: 'TrimEndMethodCallNegation' },
    trimStart: { replacement: 'trimEnd', mutationOperator: 'TrimStartMethodCallNegation' },
    min: { replacement: 'max', mutationOperator: 'MinMethodCallNegation' },
    max: { replacement: 'min', mutationOperator: 'MaxMethodCallNegation' },
  },

  *mutate(path) {
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

    // Replace the method expression. I.e. `foo.toLowerCase()` => `foo.toUpperCase`
    const nodeArguments = path.node.arguments.map((argumentNode) => deepCloneNode(argumentNode));

    let mutatedCallee = undefined;

    if (mutation.replacement != null) {
      mutatedCallee = types.isMemberExpression(callee)
        ? types.memberExpression(deepCloneNode(callee.object), types.identifier(mutation.replacement as string), false, callee.optional)
        : types.optionalMemberExpression(deepCloneNode(callee.object), types.identifier(mutation.replacement as string), false, callee.optional);
    } else if (typeof mutation.replacement == 'object' && mutation.replacement == null) {
      yield [deepCloneNode(callee.object), mutation.mutationOperator];
      return;
    }

    if (mutatedCallee != undefined) {
      yield [
        types.isCallExpression(path.node)
          ? types.callExpression(mutatedCallee, nodeArguments)
          : types.optionalCallExpression(mutatedCallee, nodeArguments, path.node.optional),
        mutation.mutationOperator,
      ];
    }
  },
};
