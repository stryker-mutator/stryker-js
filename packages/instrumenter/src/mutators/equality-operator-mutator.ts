import babel, { types } from '@babel/core';

import { EqualityOperator } from '@stryker-mutator/api/core';

import { NodeMutator } from './node-mutator.js';

const { types: t } = babel;

export const equalityOperatorMutator: NodeMutator<EqualityOperator> = {
  name: 'EqualityOperator',

  operators: {
    '<To<=': { replacement: '<=', mutationName: 'LessThanOperatorBoundary' },
    '<To>=': { replacement: '>=', mutationName: 'LessThanOperatorNegation' },

    '<=To<': { replacement: '<', mutationName: 'LessThanEqualOperatorBoundary' },
    '<=To>': { replacement: '>', mutationName: 'LessThanEqualOperatorNegation' },

    '>To>=': { replacement: '>=', mutationName: 'GreaterThanOperatorBoundary' },
    '>To<=': { replacement: '<=', mutationName: 'GreaterThanOperatorNegation' },

    '>=To>': { replacement: '>', mutationName: 'GreaterThanEqualOperatorBoundary' },
    '>=To<': { replacement: '<', mutationName: 'GreaterThanEqualOperatorNegation' },

    '==To!=': { replacement: '!=', mutationName: 'EqualityOperatorNegation' },
    '!=To==': { replacement: '==', mutationName: 'InequalityOperatorNegation' },
    '===To!==': { replacement: '!==', mutationName: 'StrictEqualityOperatorNegation' },
    '!==To===': { replacement: '===', mutationName: 'StrictInequalityOperatorNegation' },
  },

  *mutate(path, levelMutations) {
    if (path.isBinaryExpression() && isEqualityOperator(path.node.operator)) {
      const allMutations = filterMutationLevel(path.node, levelMutations);
      // throw new Error(allMutations.toString());
      for (const mutableOperator of allMutations) {
        const replacementOperator = t.cloneNode(path.node, true);
        replacementOperator.operator = mutableOperator.replacement;
        yield replacementOperator;
      }
    }
  },
};

function isEqualityOperator(operator: string): operator is keyof typeof equalityOperatorMutator.operators {
  return Object.keys(equalityOperatorMutator.operators).some((k) => k.startsWith(operator + 'To'));
}

function filterMutationLevel(node: types.BinaryExpression, levelMutations: string[] | undefined) {
  // Nothing allowed, so return an empty array

  const allMutations = Object.keys(equalityOperatorMutator.operators)
    .filter((k) => k.startsWith(node.operator + 'To'))
    .map((k) => equalityOperatorMutator.operators[k]);

  if (levelMutations === undefined) {
    return allMutations;
  }

  return allMutations.filter((mut) => levelMutations.some((op) => op === mut.mutationName));
}
