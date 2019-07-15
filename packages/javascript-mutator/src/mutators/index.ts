import ArrayLiteralMutator from './ArrayLiteralMutator';
import ArrayNewExpressionMutator from './ArrayNewExpressionMutator';
import BinaryExpressionMutator from './BinaryExpressionMutator';
import BlockMutator from './BlockMutator';
import BooleanSubstitutionMutator from './BooleanSubstitutionMutator';
import ConditionalExpressionMutator from './ConditionalExpressionMutator';
import DoStatementMutator from './DoStatementMutator';
import ForStatementMutator from './ForStatementMutator';
import IfStatementMutator from './IfStatementMutator';
import ObjectLiteralMutator from './ObjectLiteralMutator';
import PostfixUnaryExpressionMutator from './PostfixUnaryExpressionMutator';
import PrefixUnaryExpressionMutator from './PrefixUnaryExpressionMutator';
import StringLiteralMutator from './StringLiteralMutator';
import SwitchCaseMutator from './SwitchCaseMutator';
import WhileStatementMutator from './WhileStatementMutator';

export const NODE_MUTATORS = Object.freeze([
  new ArrayLiteralMutator(),
  new ArrayNewExpressionMutator(),
  new BinaryExpressionMutator(),
  new BlockMutator(),
  new BooleanSubstitutionMutator(),
  new ConditionalExpressionMutator(),
  new DoStatementMutator(),
  new ForStatementMutator(),
  new IfStatementMutator(),
  new ObjectLiteralMutator(),
  new PostfixUnaryExpressionMutator(),
  new PrefixUnaryExpressionMutator(),
  new StringLiteralMutator(),
  new SwitchCaseMutator(),
  new WhileStatementMutator()
]);
