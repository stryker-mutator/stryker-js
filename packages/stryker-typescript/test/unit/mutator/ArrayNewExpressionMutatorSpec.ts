import ArrayNewExpressionMutator from '../../../src/mutator/ArrayNewExpressionMutator';
import { verifySpecification } from './mutatorAssertions';
import { ArrayNewExpressionMutatorSpec } from 'stryker-mutator-specification/src/index';

verifySpecification(ArrayNewExpressionMutatorSpec, ArrayNewExpressionMutator);