import { WhileStatementMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';
import WhileStatementMutator from '../../../src/mutator/WhileStatementMutator';
import { verifySpecification } from './mutatorAssertions';

verifySpecification(WhileStatementMutatorSpec, WhileStatementMutator);
