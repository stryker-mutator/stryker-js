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

export const assignmentOperatorMutator: NodeMutator = {
  name: 'AssignmentOperator',

  *mutate(path) {
    if (path.isAssignmentExpression() && isSupported(path.node.operator, path.node)) {
      const mutatedOperator = AssignmentOperators[path.node.operator];
      const replacement = types.cloneNode(path.node, false);
      replacement.operator = mutatedOperator;
      yield replacement;
    }
  },
};

function isSupported(operator: string, node: types.AssignmentExpression): operator is keyof typeof AssignmentOperators {
  if (!Object.keys(AssignmentOperators).includes(operator)) {
    return false;
  }

  const stringTypes = ['StringLiteral', 'TemplateLiteral'];

  const stringAssignmentTypes = ['&&=', '||=', '??=']

  if (stringTypes.includes(node.right.type) && !stringAssignmentTypes.includes(operator)) {
    return false;
  }

  return true;
}
