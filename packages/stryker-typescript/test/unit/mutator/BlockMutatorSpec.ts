import BlockMutatorSpec from 'stryker-mutator-specification/src/BlockMutatorSpec';
import BlockMutator from '../../../src/mutator/BlockMutator';
import { verifySpecification } from './mutatorAssertions';

verifySpecification(BlockMutatorSpec, BlockMutator);
