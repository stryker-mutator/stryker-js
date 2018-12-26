import { BooleanSubstitutionMutatorSpec } from 'stryker-mutator-specification/src/index';
import BooleanSubstitutionMutator from '../../../src/mutators/BooleanSubstitutionMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(BooleanSubstitutionMutatorSpec, BooleanSubstitutionMutator);
