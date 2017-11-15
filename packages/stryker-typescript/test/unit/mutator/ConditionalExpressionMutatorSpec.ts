import ConditionalExpressionMutator from '../../../src/mutator/ConditionalExpressionMutator';
import { expectMutation } from './mutatorAssertions';
import ConditionalExpressionMutatorSpec from 'stryker-mutator-specification/src/ConditionalExpressionMutatorSpec';

ConditionalExpressionMutatorSpec(new ConditionalExpressionMutator().name, expectMutation(new ConditionalExpressionMutator()));
