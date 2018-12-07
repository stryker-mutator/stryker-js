import BooleanSubstitutionMutator from '../../../src/mutators/BooleanSubstitutionMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { BooleanSubstitutionMutatorSpec } from 'stryker-mutator-specification/src/index';

verifySpecification(BooleanSubstitutionMutatorSpec, BooleanSubstitutionMutator);
