import { ConditionalExpressionMutatorSpec } from 'stryker-mutator-specification/src/index';
import ConditionalExpressionMutator from '../../../src/mutators/ConditionalExpressionMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(ConditionalExpressionMutatorSpec, ConditionalExpressionMutator);
