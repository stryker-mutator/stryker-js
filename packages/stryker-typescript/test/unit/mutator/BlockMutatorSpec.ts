import { expectMutation } from './mutatorAssertions';
import BlockMutator from '../../../src/mutator/BlockMutator';
import BlockMutatorSpec from 'stryker-mutator-specification/src/BlockMutatorSpec';

BlockMutatorSpec(new BlockMutator().name, expectMutation(new BlockMutator()));