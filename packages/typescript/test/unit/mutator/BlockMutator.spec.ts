import { verifySpecification } from './mutatorAssertions';
import BlockMutator from '../../../src/mutator/BlockMutator';
import BlockMutatorSpec from '@stryker-mutator/mutator-specification/src/BlockMutatorSpec';

verifySpecification(BlockMutatorSpec, BlockMutator);
