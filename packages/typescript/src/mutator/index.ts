import ArrayLiteralMutator from './ArrayLiteralMutator';
import ArrayNewExpressionMutator from './ArrayNewExpressionMutator';
import ArrowFunctionMutator from './ArrowFunctionMutator';
import BinaryExpressionMutator from './BinaryExpressionMutator';
import BlockMutator from './BlockMutator';
import BooleanSubstitutionMutator from './BooleanSubstitutionMutator';
import ConditionalExpressionMutator from './ConditionalExpressionMutator';
import DoStatementMutator from './DoStatementMutator';
import ForStatementMutator from './ForStatementMutator';
import IfStatementMutator from './IfStatementMutator';
import NodeMutator from './NodeMutator';
import ObjectLiteralMutator from './ObjectLiteralMutator';
import PrefixUnaryExpressionMutator from './PrefixUnaryExpressionMutator';
import StringLiteralMutator from './StringLiteralMutator';
import SwitchCaseMutator from './SwitchCaseMutator';
import WhileStatementMutator from './WhileStatementMutator';

export const nodeMutators: ReadonlyArray<NodeMutator> = [
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
