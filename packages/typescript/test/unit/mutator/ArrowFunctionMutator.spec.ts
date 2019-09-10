import ArrowFunctionMutatorSpec from '@stryker-mutator/mutator-specification/src/ArrowFunctionMutatorSpec';
import ArrowFunctionMutator from '../../../src/mutator/ArrowFunctionMutator';
import { verifySpecification } from './mutatorAssertions';

verifySpecification(ArrowFunctionMutatorSpec, ArrowFunctionMutator);
