import NodeMutatorFactory from '../NodeMutatorFactory';
import ArrayDeclaratorMutator from './ArrayDeclaratorMutator';
import BinaryOperatorMutator from './BinaryOperatorMutator';
import BlockStatementMutator from './BlockStatementMutator';
import BooleanSubstitutionMutator from './BooleanSubstitutionMutator';
import LogicalOperatorMutator from './LogicalOperatorMutator';
import RemoveConditionalsMutator from './RemoveConditionalsMutator';
import UnaryOperatorMutator from './UnaryOperatorMutator';
import UpdateOperatorMutator from './UpdateOperatorMutator';

const factory = NodeMutatorFactory.instance();
factory.register(ArrayDeclaratorMutator.name, ArrayDeclaratorMutator);
factory.register(BinaryOperatorMutator.name, BinaryOperatorMutator);
factory.register(BlockStatementMutator.name, BlockStatementMutator);
factory.register(BooleanSubstitutionMutator.name, BooleanSubstitutionMutator);
factory.register(LogicalOperatorMutator.name, LogicalOperatorMutator);
factory.register(RemoveConditionalsMutator.name, RemoveConditionalsMutator);
factory.register(UnaryOperatorMutator.name, UnaryOperatorMutator);
factory.register(UpdateOperatorMutator.name, UpdateOperatorMutator);