import UnaryNotMutator from '../../../src/mutator/UnaryNotMutator';
import { expectMutation } from './mutatorAssertions';
import UnaryNotMutatorSpec from 'stryker-mutator-specification/src/UnaryNotMutatorSpec';

UnaryNotMutatorSpec(new UnaryNotMutator().name, expectMutation(new UnaryNotMutator()));
