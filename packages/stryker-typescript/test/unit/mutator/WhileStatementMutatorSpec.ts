import WhileStatementMutator from '../../../src/mutator/WhileStatementMutator';
import { expectMutation } from './mutatorAssertions';
import { WhileStatementMutatorSpec } from 'stryker-mutator-specification/src/index';

WhileStatementMutatorSpec(new WhileStatementMutator().name, expectMutation(new WhileStatementMutator()));
