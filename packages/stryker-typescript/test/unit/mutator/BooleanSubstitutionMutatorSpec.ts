import BooleanSubstitutionMutator from '../../../src/mutator/BooleanSubstitutionMutator';
import { expectMutation } from './mutatorAssertions';
import BooleanSubstitutionMutatorSpec from 'stryker-mutator-specification/src/BooleanSubstitutionMutatorSpec';

BooleanSubstitutionMutatorSpec(new BooleanSubstitutionMutator().name, expectMutation(new BooleanSubstitutionMutator()));
