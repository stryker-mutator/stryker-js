import { verifySpecification } from './mutatorAssertions';
import ArrowFunctionMutator from '../../../src/mutator/ArrowFunctionMutator';
import ArrowFunctionMutatorSpec from '@stryker-mutator/mutator-specification/src/ArrowFunctionMutatorSpec';

verifySpecification(ArrowFunctionMutatorSpec, ArrowFunctionMutator);
