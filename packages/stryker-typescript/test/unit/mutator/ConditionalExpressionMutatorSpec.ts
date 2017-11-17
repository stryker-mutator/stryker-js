import ConditionalExpressionMutator from '../../../src/mutator/ConditionalExpressionMutator';
import { verifySpecification } from './mutatorAssertions';
import ConditionalExpressionMutatorSpec from 'stryker-mutator-specification/src/ConditionalExpressionMutatorSpec';

verifySpecification(ConditionalExpressionMutatorSpec, ConditionalExpressionMutator);
