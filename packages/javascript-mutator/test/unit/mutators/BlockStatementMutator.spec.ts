import { BlockStatementMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

import BlockStatementMutator from '../../../src/mutators/BlockStatementMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(BlockStatementMutatorSpec, BlockStatementMutator);
