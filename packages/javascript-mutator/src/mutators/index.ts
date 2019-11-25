import ArithmeticOperatorMutator from './ArithmeticOperatorMutator';
import ArrayDeclarationMutator from './ArrayDeclarationMutator';
import BlockStatementMutator from './BlockStatementMutator';
import BooleanLiteralMutator from './BooleanLiteralMutator';
import ConditionalExpressionMutator from './ConditionalExpressionMutator';
import EqualityOperatorMutator from './EqualityOperatorMutator';
import NumericValueMutator from './NumericValueMutator';
import ObjectLiteralMutator from './ObjectLiteralMutator';
import StringLiteralMutator from './StringLiteralMutator';
import LogicalOperatorMutator from './LogicalOperatorMutator';
import UnaryOperatorMutator from './UnaryOperatorMutator';
import UpdateOperatorMutator from './UpdateOperatorMutator';

export const nodeMutators = Object.freeze([
  new ArithmeticOperatorMutator(),
  new ArrayDeclarationMutator(),
  new BlockStatementMutator(),
  new BooleanLiteralMutator(),
  new ConditionalExpressionMutator(),
  new EqualityOperatorMutator(),
  new LogicalOperatorMutator(),
  new NumericValueMutator(),
  new ObjectLiteralMutator(),
  new StringLiteralMutator(),
  new UnaryOperatorMutator(),
  new UpdateOperatorMutator()
]);
