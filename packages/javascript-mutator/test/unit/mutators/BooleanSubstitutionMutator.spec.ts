import { BooleanSubstitutionMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';
import BooleanSubstitutionMutator from '../../../src/mutators/BooleanSubstitutionMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(BooleanSubstitutionMutatorSpec, BooleanSubstitutionMutator);
