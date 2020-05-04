import ArrowFunctionPropertyMutatorSpec from '@stryker-mutator/mutator-specification/src/ArrowFunctionPropertyMutatorSpec';

import ArrowFunctionPropertyMutator from '../../../src/mutators/ArrowFunctionPropertyMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(ArrowFunctionPropertyMutatorSpec, ArrowFunctionPropertyMutator);
