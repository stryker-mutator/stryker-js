import { BooleanLiteralMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

import BooleanLiteralMutator from '../../../src/mutators/BooleanLiteralMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(BooleanLiteralMutatorSpec, BooleanLiteralMutator);
