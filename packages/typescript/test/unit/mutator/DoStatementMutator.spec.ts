import DoStatementMutatorSpec from '@stryker-mutator/mutator-specification/src/DoStatementMutatorSpec';

import DoStatementMutator from '../../../src/mutator/DoStatementMutator';

import { verifySpecification } from './mutatorAssertions';

verifySpecification(DoStatementMutatorSpec, DoStatementMutator);
