import { PrefixUnaryExpressionMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

import PrefixUnaryExpressionMutator from '../../../src/mutators/PrefixUnaryExpressionMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(PrefixUnaryExpressionMutatorSpec, PrefixUnaryExpressionMutator);
