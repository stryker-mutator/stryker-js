import ArrowFunctionMutatorSpec from '@stryker-mutator/mutator-specification/src/ArrowFunctionMutatorSpec';

import ArrowFunctionMutator from '../../../src/mutators/ArrowFunctionMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(ArrowFunctionMutatorSpec, ArrowFunctionMutator);
