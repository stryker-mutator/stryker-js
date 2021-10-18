import * as types from '@babel/types';

import { NodeMutator } from '.';

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
    if (path.isAssignmentExpression() && isSupported(path.node)) {
      const mutatedOperator = AssignmentOperators[path.node.operator];
      const replacement = types.cloneNode(path.node, false);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  },
};

function isSupportedAssignmentOperator(operator: string): boolean {
  return Object.keys(AssignmentOperators).includes(operator);
}

function isSupported(node: types.AssignmentExpression): boolean {
  if (isSupportedAssignmentOperator(node.operator)) {
    return false;
  }

  if (stringTypes.includes(node.right.type) && !stringAssignmentTypes.includes(node.operator)) {
    return false;
  }

  return true;
}
