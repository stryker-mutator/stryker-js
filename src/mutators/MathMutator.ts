import {Syntax} from 'esprima';
import OperatorMutator from './OperatorMutator';

export default class MathMutator extends OperatorMutator {
  
  constructor () {
   super('Math', [Syntax.BinaryExpression], {
      '+': '-',
      '-': '+',
      '*': '/',
      '/': '*',
      '%': '*'});
  }

}
