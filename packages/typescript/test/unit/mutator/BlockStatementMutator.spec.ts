import BlockStatementMutatorSpec from '@stryker-mutator/mutator-specification/src/BlockStatementMutatorSpec';

import BlockStatementMutator from '../../../src/mutator/BlockStatementMutator';

import { verifySpecification } from './mutatorAssertions';

verifySpecification(BlockStatementMutatorSpec, BlockStatementMutator);
