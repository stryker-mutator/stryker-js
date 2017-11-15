import PrefixUnaryExpressionMutator from '../../../src/mutator/PrefixUnaryExpressionMutator';
import { expectMutation } from './mutatorAssertions';
import PrefixUnaryExpressionMutatorSpec from 'stryker-mutator-specification/src/PrefixUnaryExpressionMutatorSpec';

PrefixUnaryExpressionMutatorSpec(new PrefixUnaryExpressionMutator().name, expectMutation(new PrefixUnaryExpressionMutator()));
