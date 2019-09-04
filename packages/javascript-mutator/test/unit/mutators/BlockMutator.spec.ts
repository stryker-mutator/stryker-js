import { BlockMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';
import BlockMutator from '../../../src/mutators/BlockMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(BlockMutatorSpec, BlockMutator);
