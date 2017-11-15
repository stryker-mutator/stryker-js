import ArrayNewExpressionMutator from '../../../src/mutator/ArrayNewExpressionMutator';
import { expectMutation } from './mutatorAssertions';
import { ArrayNewExpressionMutatorSpec } from 'stryker-mutator-specification/src/index';

ArrayNewExpressionMutatorSpec(new ArrayNewExpressionMutator().name, expectMutation(new ArrayNewExpressionMutator()));