import { EqualityOperatorMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

import EqualityOperatorMutator from '../../../src/mutators/EqualityOperatorMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(EqualityOperatorMutatorSpec, EqualityOperatorMutator);
