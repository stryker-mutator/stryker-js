import {BinaryOperator, LogicalOperator} from 'stryker-api/estree';

interface OperatorMutatorMap{
  [targetedOperator: string]: BinaryOperator;
}
export default OperatorMutatorMap;