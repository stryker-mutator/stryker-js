import ArrayLiteralMutator from '../../../src/mutator/ArrayLiteralMutator';
import { verifySpecification } from './mutatorAssertions';
import { ArrayLiteralMutatorSpec } from '@stryker-mutator/mutator-specification';

verifySpecification(ArrayLiteralMutatorSpec, ArrayLiteralMutator);
