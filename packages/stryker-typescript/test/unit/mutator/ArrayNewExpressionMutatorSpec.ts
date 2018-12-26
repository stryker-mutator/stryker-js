import { ArrayNewExpressionMutatorSpec } from 'stryker-mutator-specification/src/index';
import ArrayNewExpressionMutator from '../../../src/mutator/ArrayNewExpressionMutator';
import { verifySpecification } from './mutatorAssertions';

verifySpecification(ArrayNewExpressionMutatorSpec, ArrayNewExpressionMutator);
