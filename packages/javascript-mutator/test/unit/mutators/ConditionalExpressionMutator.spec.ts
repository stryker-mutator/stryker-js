import ConditionalExpressionMutator from '../../../src/mutators/ConditionalExpressionMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { ConditionalExpressionMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

verifySpecification(ConditionalExpressionMutatorSpec, ConditionalExpressionMutator);
