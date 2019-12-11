import ArithmeticOperatorMutatorSpec from '@stryker-mutator/mutator-specification/src/ArithmeticOperatorMutatorSpec';

import ArithmeticOperatorMutator from '../../../src/mutator/ArithmeticOperatorMutator';

import { verifySpecification } from './mutatorAssertions';

verifySpecification(ArithmeticOperatorMutatorSpec, ArithmeticOperatorMutator);
