'use strict';

import {Syntax} from 'esprima';
import BaseOperatorMutation from './BaseOperatorMutation';

export default class ReverseConditionalMutation extends BaseOperatorMutation {
  constructor(){
    super('ReverseConditional', [Syntax.BinaryExpression, Syntax.LogicalExpression], {
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
