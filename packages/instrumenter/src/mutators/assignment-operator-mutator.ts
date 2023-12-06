import type { types } from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutatorConfiguration } from '../mutation-level/mutation-level.js';

import { NodeMutator } from './index.js';

const operators: NodeMutatorConfiguration = {
  '+=': { replacement: '-=', mutationName: '+=To-=' },
  '-=': { replacement: '+=', mutationName: '-=To+=' },
  '*=': { replacement: '/=', mutationName: '*=To/=' },
  '/=': { replacement: '*=', mutationName: '/=To*=' },
  '%=': { replacement: '*=', mutationName: '%=To*=' },
  '<<=': { replacement: '>>=', mutationName: '<<=To>>=' },
  '>>=': { replacement: '<<=', mutationName: '>>=To<<=' },
  '&=': { replacement: '|=', mutationName: '&=To|=' },
  '|=': { replacement: '&=', mutationName: '|=To&=' },
  '&&=': { replacement: '||=', mutationName: '&&=To||=' },
  '||=': { replacement: '&&=', mutationName: '||=To&&=' },
  '??=': { replacement: '&&=', mutationName: '??=To&&=' },
};

const stringTypes = Object.freeze(['StringLiteral', 'TemplateLiteral']);
const stringAssignmentTypes = Object.freeze(['&&=', '||=', '??=']);

export const assignmentOperatorMutator: NodeMutator = {
  name: 'AssignmentOperator',

  *mutate(path, levelMutations) {
    if (
      path.isAssignmentExpression() &&
      isSupportedAssignmentOperator(path.node.operator) &&
      isSupported(path.node) &&
      isInMutationLevel(path.node, levelMutations)
    ) {
      const mutatedOperator = operators[path.node.operator].replacement;
      const replacementOperator = deepCloneNode(path.node);
      replacementOperator.operator = mutatedOperator;
      yield replacementOperator;
    }
  },
};

function isInMutationLevel(node: types.AssignmentExpression, operations: string[] | undefined): boolean {
  if (operations === undefined) {
    return true;
  }
  const { mutationName } = operators[node.operator];
  return operations.some((op) => op === mutationName);
}

function isSupportedAssignmentOperator(operator: string): operator is keyof typeof operators {
  return Object.keys(operators).includes(operator);
}

function isSupported(node: types.AssignmentExpression): boolean {
  // Excludes assignment operators that apply to strings.
  if (stringTypes.includes(node.right.type) && !stringAssignmentTypes.includes(node.operator)) {
    return false;
  }

  return true;
}
