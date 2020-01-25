import { UnaryOperatorMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

import UnaryOperatorMutator from '../../../src/mutators/UnaryOperatorMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(UnaryOperatorMutatorSpec, UnaryOperatorMutator);
