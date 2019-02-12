import WhileStatementMutator from '../../../src/mutators/WhileStatementMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { WhileStatementMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

verifySpecification(WhileStatementMutatorSpec, WhileStatementMutator);
