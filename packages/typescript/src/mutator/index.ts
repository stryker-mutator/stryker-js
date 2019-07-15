import NodeMutator from './NodeMutator';
import SwitchCaseMutator from './SwitchCaseMutator';
import StringLiteralMutator from './StringLiteralMutator';
import BinaryExpressionMutator from './BinaryExpressionMutator';
import BooleanSubstitutionMutator from './BooleanSubstitutionMutator';
import ArrayLiteralMutator from './ArrayLiteralMutator';
import ArrayNewExpressionMutator from './ArrayNewExpressionMutator';
import BlockMutator from './BlockMutator';
import ArrowFunctionMutator from './ArrowFunctionMutator';
import IfStatementMutator from './IfStatementMutator';
import ObjectLiteralMutator from './ObjectLiteralMutator';
import WhileStatementMutator from './WhileStatementMutator';
import ForStatementMutator from './ForStatementMutator';
import DoStatementMutator from './DoStatementMutator';
import ConditionalExpressionMutator from './ConditionalExpressionMutator';
import PrefixUnaryExpressionMutator from './PrefixUnaryExpressionMutator';

export const NODE_MUTATORS: ReadonlyArray<NodeMutator> = [
  new BinaryExpressionMutator(),
  new BooleanSubstitutionMutator(),
  new ArrayLiteralMutator(),
  new ArrayNewExpressionMutator(),
  new BlockMutator(),
  new ArrowFunctionMutator(),
  new IfStatementMutator(),
  new ObjectLiteralMutator(),
  new WhileStatementMutator(),
  new ForStatementMutator(),
  new DoStatementMutator(),
  new ConditionalExpressionMutator(),
  new PrefixUnaryExpressionMutator(),
  new StringLiteralMutator(),
  new SwitchCaseMutator(),
];
