import BinaryExpressionMutator from '../../../src/mutator/BinaryExpressionMutator';
import { verifySpecification } from './mutatorAssertions';
import BinaryExpressionMutatorSpec from 'stryker-mutator-specification/src/BinaryExpressionMutatorSpec';

verifySpecification(BinaryExpressionMutatorSpec, BinaryExpressionMutator);
