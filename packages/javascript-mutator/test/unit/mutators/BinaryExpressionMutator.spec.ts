import BinaryExpressionMutator from '../../../src/mutators/BinaryExpressionMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { BinaryExpressionMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

verifySpecification(BinaryExpressionMutatorSpec, BinaryExpressionMutator);
