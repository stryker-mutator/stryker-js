import { ArithmeticOperatorMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

import ArithmeticOperatorMutator from '../../../src/mutators/ArithmeticOperatorMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(ArithmeticOperatorMutatorSpec, ArithmeticOperatorMutator);
