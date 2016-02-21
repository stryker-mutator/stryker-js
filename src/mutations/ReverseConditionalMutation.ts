'use strict';

import BaseOperatorMutation from './BaseOperatorMutation';

export default class ReverseConditionalMutation extends BaseOperatorMutation {
  constructor(){
    super('ReverseConditional', ['BinaryExpression', 'LogicalExpression'], {
        '==': '!=',
        '!=': '==',
        '===': '!==',
        '!==': '===',
        '<=': '>',
        '>=': '<',
        '<': '>=',
        '>': '<=',
        '&&': '||',
        '||': '&&'}); 
  }
}
