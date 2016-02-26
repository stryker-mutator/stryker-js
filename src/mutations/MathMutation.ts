'use strict';

import {Syntax} from 'esprima';
import BaseOperatorMutation from './BaseOperatorMutation';

export default class MathMutation extends BaseOperatorMutation {
  
  constructor () {
   super('Math', [Syntax.BinaryExpression], {
      '+': '-',
      '-': '+',
      '*': '/',
      '/': '*',
      '%': '*'});
  }

}
