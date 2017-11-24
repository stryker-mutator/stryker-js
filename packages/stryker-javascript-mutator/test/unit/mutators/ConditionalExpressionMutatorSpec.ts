import ConditionalExpressionMutator from '../../../src/mutators/ConditionalExpressionMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { ConditionalExpressionMutatorSpec } from 'stryker-mutator-specification/src/index';

verifySpecification(ConditionalExpressionMutatorSpec, ConditionalExpressionMutator);