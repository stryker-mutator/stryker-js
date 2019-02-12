import ArrayNewExpressionMutator from '../../../src/mutator/ArrayNewExpressionMutator';
import { verifySpecification } from './mutatorAssertions';
import { ArrayNewExpressionMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

verifySpecification(ArrayNewExpressionMutatorSpec, ArrayNewExpressionMutator);
