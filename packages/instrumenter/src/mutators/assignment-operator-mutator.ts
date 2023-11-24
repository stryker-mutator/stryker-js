import type { types } from '@babel/core';

import { deepCloneNode } from '../util/index.js';

import { NodeMutator } from './index.js';

const assignmentOperatorReplacements = Object.freeze({
  '+=': { replacement: '-=', mutatorName: '+=To-=' },
  '-=': { replacement: '+=', mutatorName: '-=To+=' },
  '*=': { replacement: '/=', mutatorName: '*=To/=' },
  '/=': { replacement: '*=', mutatorName: '/=To*=' },
  '%=': { replacement: '*=', mutatorName: '%=To*=' },
  '<<=': { replacement: '>>=', mutatorName: '<<=To>>=' },
  '>>=': { replacement: '<<=', mutatorName: '>>=To<<=' },
  '&=': { replacement: '|=', mutatorName: '&=To|=' },
  '|=': { replacement: '&=', mutatorName: '|=To&=' },
  '&&=': { replacement: '||=', mutatorName: '&&=To||=' },
  '||=': { replacement: '&&=', mutatorName: '||=To&&=' },
  '??=': { replacement: '&&=', mutatorName: '??=To&&=' },
} as const);

const stringTypes = Object.freeze(['StringLiteral', 'TemplateLiteral']);
const stringAssignmentTypes = Object.freeze(['&&=', '||=', '??=']);

export const assignmentOperatorMutator: NodeMutator = {
  name: 'AssignmentOperator',

  *mutate(path, options) {
    if (
      path.isAssignmentExpression() &&
      isSupportedAssignmentOperator(path.node.operator) &&
      isSupported(path.node) &&
      isInMutationLevel(path.node, options)
    ) {
      const mutatedOperator = assignmentOperatorReplacements[path.node.operator].replacement;
      const replacement = deepCloneNode(path.node);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  },
};

function isInMutationLevel(node: types.AssignmentExpression, operations: string[] | undefined): boolean {
  if (operations === undefined) {
    return true;
  }
  const { mutatorName } = assignmentOperatorReplacements[node.operator as keyof typeof assignmentOperatorReplacements];
  return operations.some((op) => op === mutatorName);
}

function isSupportedAssignmentOperator(operator: string): operator is keyof typeof assignmentOperatorReplacements {
  return Object.keys(assignmentOperatorReplacements).includes(operator);
}

function isSupported(node: types.AssignmentExpression): boolean {
  // Excludes assignment operators that apply to strings.
  if (stringTypes.includes(node.right.type) && !stringAssignmentTypes.includes(node.operator)) {
    return false;
  }

  return true;
}
