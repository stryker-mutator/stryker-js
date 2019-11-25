import { NumericValueMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

import NumericValueMutator from '../../../src/mutators/NumericValueMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(NumericValueMutatorSpec, NumericValueMutator);
