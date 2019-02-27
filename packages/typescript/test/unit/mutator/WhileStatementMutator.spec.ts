import WhileStatementMutator from '../../../src/mutator/WhileStatementMutator';
import { verifySpecification } from './mutatorAssertions';
import { WhileStatementMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

verifySpecification(WhileStatementMutatorSpec, WhileStatementMutator);
