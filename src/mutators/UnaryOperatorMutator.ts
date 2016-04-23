import {Syntax} from 'esprima';
import OperatorMutator from './OperatorMutator';
import MutatorFactory from '../MutatorFactory';

export default class UnaryOperatorMutator extends OperatorMutator {
  constructor() {
    super('UnaryOperator', [Syntax.UpdateExpression, Syntax.UnaryExpression], {
        '++': '--',
        '--': '++',
        '-': '+',
        '+': '-'});
  }
}

MutatorFactory.instance().register('UnaryOperator', UnaryOperatorMutator);