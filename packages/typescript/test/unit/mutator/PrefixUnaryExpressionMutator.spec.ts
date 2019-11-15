import PrefixUnaryExpressionMutatorSpec from '@stryker-mutator/mutator-specification/src/PrefixUnaryExpressionMutatorSpec';

import PrefixUnaryExpressionMutator from '../../../src/mutator/PrefixUnaryExpressionMutator';

import { verifySpecification } from './mutatorAssertions';

verifySpecification(PrefixUnaryExpressionMutatorSpec, PrefixUnaryExpressionMutator);
