import { expectMutation } from './mutatorAssertions';
import ArrowFunctionMutator from '../../../src/mutator/ArrowFunctionMutator';
import ArrowFunctionMutatorSpec from 'stryker-mutator-specification/src/ArrowFunctionMutatorSpec';

ArrowFunctionMutatorSpec(new ArrowFunctionMutator().name, expectMutation(new ArrowFunctionMutator()));