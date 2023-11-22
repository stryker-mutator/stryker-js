import babel, { types } from '@babel/core';

import { NodeMutator } from './node-mutator.js';

const { types: t } = babel;

const operators = {
  '<': [
    { replacement: '<=', mutatorName: '<To<=' },
    { replacement: '>=', mutatorName: '<To>=' },
  ],
  '<=': [
    { replacement: '<', mutatorName: '<=To<' },
    { replacement: '>', mutatorName: '<=To>' },
  ],
  '>': [
    { replacement: '>=', mutatorName: '>To>=' },
    { replacement: '<=', mutatorName: '>To<=' },
  ],
  '>=': [
    { replacement: '>', mutatorName: '>=To>' },
    { replacement: '<', mutatorName: '>=To<' },
  ],
  '==': [{ replacement: '!=', mutatorName: '==To!=' }],
  '!=': [{ replacement: '==', mutatorName: '!=To==' }],
  '===': [{ replacement: '!==', mutatorName: '===To!==' }],
  '!==': [{ replacement: '===', mutatorName: '!==To===' }],
} as const;

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
        const replacement = t.cloneNode(path.node, true);
        replacement.operator = mutableOperator.replacement;
        yield replacement;
      }
    }
  },
};

function filterMutationLevel(node: types.BinaryExpression, operations: string[] | undefined) {
  const allMutations = operators[node.operator as keyof typeof operators];

  // Nothing allowed, so return an empty array
  if (operations === undefined) {
    return allMutations;
  }

  return allMutations.filter((mut) => operations.some((op) => op === mut.mutatorName));
}
