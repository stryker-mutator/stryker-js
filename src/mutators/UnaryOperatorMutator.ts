import {Syntax} from 'esprima';
import OperatorMutator from './OperatorMutator';

export default class UnaryOperatorMutator extends OperatorMutator {
  constructor() {
    super('Unary operator', [Syntax.UpdateExpression, Syntax.UnaryExpression], {
        '++': '--',
        '--': '++',
        '-': '+',
        '+': '-'});
  }
}
