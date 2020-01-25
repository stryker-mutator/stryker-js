import BooleanLiteralMutatorSpec from '@stryker-mutator/mutator-specification/src/BooleanLiteralMutatorSpec';

import BooleanLiteralMutator from '../../../src/mutator/BooleanLiteralMutator';

import { verifySpecification } from './mutatorAssertions';

verifySpecification(BooleanLiteralMutatorSpec, BooleanLiteralMutator);
