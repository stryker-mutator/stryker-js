import BinaryExpressionMutatorSpec from 'stryker-mutator-specification/src/BinaryExpressionMutatorSpec';
import BinaryExpressionMutator from '../../../src/mutator/BinaryExpressionMutator';
import { verifySpecification } from './mutatorAssertions';

verifySpecification(BinaryExpressionMutatorSpec, BinaryExpressionMutator);
