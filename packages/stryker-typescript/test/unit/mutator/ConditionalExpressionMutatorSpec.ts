import ConditionalExpressionMutatorSpec from 'stryker-mutator-specification/src/ConditionalExpressionMutatorSpec';
import ConditionalExpressionMutator from '../../../src/mutator/ConditionalExpressionMutator';
import { verifySpecification } from './mutatorAssertions';

verifySpecification(ConditionalExpressionMutatorSpec, ConditionalExpressionMutator);
