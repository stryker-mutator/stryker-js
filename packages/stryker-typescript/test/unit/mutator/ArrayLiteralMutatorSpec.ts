import ArrayLiteralMutator from '../../../src/mutator/ArrayLiteralMutator';
import { expectMutation } from './mutatorAssertions';
import { ArrayLiteralMutatorSpec } from 'stryker-mutator-specification';

ArrayLiteralMutatorSpec(new ArrayLiteralMutator().name, expectMutation(new ArrayLiteralMutator()));