import { WhileStatementMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';
import WhileStatementMutator from '../../../src/mutators/WhileStatementMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(WhileStatementMutatorSpec, WhileStatementMutator);
