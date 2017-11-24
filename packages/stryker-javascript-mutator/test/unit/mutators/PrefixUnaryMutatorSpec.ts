import PrefixUnaryExpressionMutator from '../../../src/mutators/PrefixUnaryExpressionMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { PrefixUnaryExpressionMutatorSpec } from 'stryker-mutator-specification/src/index';

verifySpecification(PrefixUnaryExpressionMutatorSpec, PrefixUnaryExpressionMutator);