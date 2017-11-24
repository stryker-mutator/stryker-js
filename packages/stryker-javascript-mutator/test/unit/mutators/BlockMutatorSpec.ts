import BlockMutator from '../../../src/mutators/BlockMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { BlockMutatorSpec } from 'stryker-mutator-specification/src/index';

verifySpecification(BlockMutatorSpec, BlockMutator);