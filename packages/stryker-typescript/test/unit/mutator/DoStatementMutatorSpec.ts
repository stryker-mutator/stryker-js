import DoStatementMutator from '../../../src/mutator/DoStatementMutator';
import { expectMutation } from './mutatorAssertions';
import DoStatementMutatorSpec from 'stryker-mutator-specification/src/DoStatementMutatorSpec';

DoStatementMutatorSpec(new DoStatementMutator().name, expectMutation(new DoStatementMutator()));
