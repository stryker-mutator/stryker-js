'use strict';

var util = require('util');
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
