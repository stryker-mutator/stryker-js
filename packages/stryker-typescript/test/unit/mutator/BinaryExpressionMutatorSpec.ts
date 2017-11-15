import BinaryExpressionMutator from '../../../src/mutator/BinaryExpressionMutator';
import { expectMutation } from './mutatorAssertions';
import BinaryExpressionMutatorSpec from 'stryker-mutator-specification/src/BinaryExpressionMutatorSpec';

BinaryExpressionMutatorSpec(new BinaryExpressionMutator().name, expectMutation(new BinaryExpressionMutator()));
