import BooleanSubstitutionMutator from '../../../src/mutators/BooleanSubstitutionMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { BooleanSubstitutionMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

verifySpecification(BooleanSubstitutionMutatorSpec, BooleanSubstitutionMutator);
