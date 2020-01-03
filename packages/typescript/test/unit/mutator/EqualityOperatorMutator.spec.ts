import EqualityOperatorMutatorSpec from '@stryker-mutator/mutator-specification/src/EqualityOperatorMutatorSpec';

import EqualityOperatorMutator from '../../../src/mutator/EqualityOperatorMutator';

import { verifySpecification } from './mutatorAssertions';

verifySpecification(EqualityOperatorMutatorSpec, EqualityOperatorMutator);
