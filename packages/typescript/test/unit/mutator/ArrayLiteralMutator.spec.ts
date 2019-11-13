import { ArrayLiteralMutatorSpec } from '@stryker-mutator/mutator-specification';

import ArrayLiteralMutator from '../../../src/mutator/ArrayLiteralMutator';

import { verifySpecification } from './mutatorAssertions';

verifySpecification(ArrayLiteralMutatorSpec, ArrayLiteralMutator);
