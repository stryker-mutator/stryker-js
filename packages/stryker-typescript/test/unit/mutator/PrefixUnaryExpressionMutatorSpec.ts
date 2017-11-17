import PrefixUnaryExpressionMutator from '../../../src/mutator/PrefixUnaryExpressionMutator';
import { verifySpecification } from './mutatorAssertions';
import PrefixUnaryExpressionMutatorSpec from 'stryker-mutator-specification/src/PrefixUnaryExpressionMutatorSpec';

verifySpecification(PrefixUnaryExpressionMutatorSpec, PrefixUnaryExpressionMutator);
