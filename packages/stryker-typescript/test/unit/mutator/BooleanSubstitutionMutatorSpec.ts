import BooleanSubstitutionMutator from '../../../src/mutator/BooleanSubstitutionMutator';
import { verifySpecification } from './mutatorAssertions';
import BooleanSubstitutionMutatorSpec from 'stryker-mutator-specification/src/BooleanSubstitutionMutatorSpec';

verifySpecification(BooleanSubstitutionMutatorSpec, BooleanSubstitutionMutator);
