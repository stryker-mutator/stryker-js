import babel from '@babel/core';

import { EqualityOperator } from '@stryker-mutator/api/core';

import { NodeMutator } from './node-mutator.js';

const { types: t } = babel;

export const equalityOperatorMutator: NodeMutator<EqualityOperator> = {
  name: 'EqualityOperator',

  operators: {
    '<To<=': { replacement: '<=', mutationOperator: 'LessThanOperatorBoundary' },
    '<To>=': { replacement: '>=', mutationOperator: 'LessThanOperatorNegation' },

    '<=To<': { replacement: '<', mutationOperator: 'LessThanEqualOperatorBoundary' },
    '<=To>': { replacement: '>', mutationOperator: 'LessThanEqualOperatorNegation' },

    '>To>=': { replacement: '>=', mutationOperator: 'GreaterThanOperatorBoundary' },
    '>To<=': { replacement: '<=', mutationOperator: 'GreaterThanOperatorNegation' },

    '>=To>': { replacement: '>', mutationOperator: 'GreaterThanEqualOperatorBoundary' },
    '>=To<': { replacement: '<', mutationOperator: 'GreaterThanEqualOperatorNegation' },

    '==To!=': { replacement: '!=', mutationOperator: 'EqualityOperatorNegation' },
    '!=To==': { replacement: '==', mutationOperator: 'InequalityOperatorNegation' },
    '===To!==': { replacement: '!==', mutationOperator: 'StrictEqualityOperatorNegation' },
    '!==To===': { replacement: '===', mutationOperator: 'StrictInequalityOperatorNegation' },
  },

  *mutate(path) {
    if (path.isBinaryExpression() && isEqualityOperator(path.node.operator)) {
      const allMutations = Object.keys(equalityOperatorMutator.operators)
        .filter((k) => k.startsWith(path.node.operator + 'To'))
        .map((k) => equalityOperatorMutator.operators[k]);

      for (const mutableOperator of allMutations) {
        const nodeClone = t.cloneNode(path.node, true);
        nodeClone.operator = mutableOperator.replacement as babel.types.BinaryExpression['operator'];
        yield [nodeClone, mutableOperator.mutationOperator];
      }
    }
  },
};

function isEqualityOperator(operator: string): operator is keyof typeof equalityOperatorMutator.operators {
  return Object.keys(equalityOperatorMutator.operators).some((k) => k.startsWith(operator + 'To'));
}
