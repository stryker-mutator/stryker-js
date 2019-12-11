import UnaryOperatorMutatorSpec from '@stryker-mutator/mutator-specification/src/UnaryOperatorMutatorSpec';

import UnaryOperatorMutator from '../../../src/mutator/UnaryOperatorMutator';

import { verifySpecification } from './mutatorAssertions';

verifySpecification(UnaryOperatorMutatorSpec, UnaryOperatorMutator);
