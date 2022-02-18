import babel, { type types as t } from '@babel/core';

import { NodeMutator } from './index.js';

const { types } = babel;

enum AssignmentOperators {
  '+=' = '-=',
  '-=' = '+=',
  '*=' = '/=',
  '/=' = '*=',
  '%=' = '*=',
  '<<=' = '>>=',
  '>>=' = '<<=',
  '&=' = '|=',
  '|=' = '&=',
  '&&=' = '||=',
  '||=' = '&&=',
  '??=' = '&&=',
}

const stringTypes = Object.freeze(['StringLiteral', 'TemplateLiteral']);
const stringAssignmentTypes = Object.freeze(['&&=', '||=', '??=']);

export const assignmentOperatorMutator: NodeMutator = {
  name: 'AssignmentOperator',

  *mutate(path) {
    if (path.isAssignmentExpression() && isSupportedAssignmentOperator(path.node.operator) && isSupported(path.node)) {
      const mutatedOperator = AssignmentOperators[path.node.operator];
      const replacement = types.cloneNode(path.node, false);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  },
};

function isSupportedAssignmentOperator(operator: string): operator is keyof typeof AssignmentOperators {
  return Object.keys(AssignmentOperators).includes(operator);
}

function isSupported(node: t.AssignmentExpression): boolean {
  // Excludes assignment operators that apply to strings.
  if (stringTypes.includes(node.right.type) && !stringAssignmentTypes.includes(node.operator)) {
    return false;
  }

  return true;
}
