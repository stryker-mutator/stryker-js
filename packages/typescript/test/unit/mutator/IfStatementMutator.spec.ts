import IfStatementMutatorSpec from '@stryker-mutator/mutator-specification/src/IfStatementMutatorSpec';

import IfStatementMutator from '../../../src/mutator/IfStatementMutator';

import { verifySpecification } from './mutatorAssertions';

verifySpecification(IfStatementMutatorSpec, IfStatementMutator);
