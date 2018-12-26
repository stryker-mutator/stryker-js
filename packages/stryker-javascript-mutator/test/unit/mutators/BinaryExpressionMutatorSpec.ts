import { BinaryExpressionMutatorSpec } from 'stryker-mutator-specification/src/index';
import BinaryExpressionMutator from '../../../src/mutators/BinaryExpressionMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(BinaryExpressionMutatorSpec, BinaryExpressionMutator);
