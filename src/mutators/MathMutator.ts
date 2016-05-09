import {Syntax} from 'esprima';
import OperatorMutator from './OperatorMutator';
import {MutatorFactory} from '../api/mutant';

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

MutatorFactory.instance().register('Math', MathMutator);