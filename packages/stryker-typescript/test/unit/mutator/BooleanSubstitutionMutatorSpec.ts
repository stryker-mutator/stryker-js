import BooleanSubstitutionMutatorSpec from 'stryker-mutator-specification/src/BooleanSubstitutionMutatorSpec';
import BooleanSubstitutionMutator from '../../../src/mutator/BooleanSubstitutionMutator';
import { verifySpecification } from './mutatorAssertions';

verifySpecification(BooleanSubstitutionMutatorSpec, BooleanSubstitutionMutator);
