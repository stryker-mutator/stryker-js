import babel, { types } from '@babel/core';

import { NodeMutatorMultiConfiguration } from '../mutation-level/mutation-level.js';

import { NodeMutator } from './node-mutator.js';

const { types: t } = babel;

const operators: NodeMutatorMultiConfiguration = {
  '<': [
    { replacement: '<=', mutationName: '<To<=' },
    { replacement: '>=', mutationName: '<To>=' },
  ],
  '<=': [
    { replacement: '<', mutationName: '<=To<' },
    { replacement: '>', mutationName: '<=To>' },
  ],
  '>': [
    { replacement: '>=', mutationName: '>To>=' },
    { replacement: '<=', mutationName: '>To<=' },
  ],
  '>=': [
    { replacement: '>', mutationName: '>=To>' },
    { replacement: '<', mutationName: '>=To<' },
  ],
  '==': [{ replacement: '!=', mutationName: '==To!=' }],
  '!=': [{ replacement: '==', mutationName: '!=To==' }],
  '===': [{ replacement: '!==', mutationName: '===To!==' }],
  '!==': [{ replacement: '===', mutationName: '!==To===' }],
};

function isEqualityOperator(operator: string): operator is keyof typeof operators {
  return Object.keys(operators).includes(operator);
}
export const equalityOperatorMutator: NodeMutator = {
  name: 'EqualityOperator',

  *mutate(path, operations) {
    if (path.isBinaryExpression() && isEqualityOperator(path.node.operator)) {
      const allMutations = filterMutationLevel(path.node, operations);
      // throw new Error(allMutations.toString());
      for (const mutableOperator of allMutations) {
        const replacementOperator = t.cloneNode(path.node, true);
        replacementOperator.operator = mutableOperator.replacement;
        yield replacementOperator;
      }
    }
  },
};

function filterMutationLevel(node: types.BinaryExpression, levelMutations: string[] | undefined) {
  const allMutations = operators[node.operator as keyof typeof operators];

  // Nothing allowed, so return an empty array
  if (levelMutations === undefined) {
    return allMutations;
  }

  return allMutations.filter((mut) => levelMutations.some((op) => op === mut.mutationName));
}
