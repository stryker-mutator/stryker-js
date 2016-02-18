'use strict';

var util = require('util');
import BaseOperatorMutation from './BaseOperatorMutation';

export default class MathMutation extends BaseOperatorMutation {
  
  constructor () {
   super('Math', ['BinaryExpression'], {
      '+': '-',
      '-': '+',
      '*': '/',
      '/': '*',
      '%': '*'});
  }

}
