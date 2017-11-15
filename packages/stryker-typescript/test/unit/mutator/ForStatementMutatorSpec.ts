import ForStatementMutator from '../../../src/mutator/ForStatementMutator';
import { expectMutation } from './mutatorAssertions';
import { ForStatementMutatorSpec } from 'stryker-mutator-specification/src/index';

ForStatementMutatorSpec(new ForStatementMutator().name, expectMutation(new ForStatementMutator()));
