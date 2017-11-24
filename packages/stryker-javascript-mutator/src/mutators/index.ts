import NodeMutatorFactory from '../NodeMutatorFactory';
import ArrayLiteralMutator from './ArrayLiteralMutator';
import ArrayNewExpressionMutator from './ArrayNewExpressionMutator';
import BinaryExpressionMutator from './BinaryExpressionMutator';
import BlockMutator from './BlockMutator';
import BooleanSubstitutionMutator from './BooleanSubstitutionMutator';
import ConditionalExpressionMutator from './ConditionalExpressionMutator';
import DoStatementMutator from './DoStatementMutator';
import ForStatementMutator from './ForStatementMutator';
import IfStatementMutator from './IfStatementMutator';
import UnaryOperatorMutator from './UnaryOperatorMutator';
import UpdateOperatorMutator from './UpdateOperatorMutator';
import WhileStatementMutator from './WhileStatementMutator';

const factory = NodeMutatorFactory.instance();
factory.register(ArrayLiteralMutator.name, ArrayLiteralMutator);
factory.register(ArrayNewExpressionMutator.name, ArrayNewExpressionMutator);
factory.register(BinaryExpressionMutator.name, BinaryExpressionMutator);
factory.register(BlockMutator.name, BlockMutator);
factory.register(BooleanSubstitutionMutator.name, BooleanSubstitutionMutator);
factory.register(ConditionalExpressionMutator.name, ConditionalExpressionMutator);
factory.register(DoStatementMutator.name, DoStatementMutator);
factory.register(ForStatementMutator.name, ForStatementMutator);
factory.register(IfStatementMutator.name, IfStatementMutator);
factory.register(UnaryOperatorMutator.name, UnaryOperatorMutator);
factory.register(UpdateOperatorMutator.name, UpdateOperatorMutator);
factory.register(WhileStatementMutator.name, WhileStatementMutator);