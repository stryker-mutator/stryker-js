import IfStatementMutator from '../../../src/mutator/IfStatementMutator';
import { expectMutation } from './mutatorAssertions';
import IfStatementMutatorSpec from 'stryker-mutator-specification/src/IfStatementMutatorSpec';

IfStatementMutatorSpec(new IfStatementMutator().name, expectMutation(new IfStatementMutator()));
