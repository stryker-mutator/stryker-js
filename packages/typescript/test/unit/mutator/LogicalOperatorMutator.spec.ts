import LogicalOperatorMutatorSpec from '@stryker-mutator/mutator-specification/src/LogicalOperatorMutatorSpec';

import LogicalOperatorMutator from '../../../src/mutator/LogicalOperatorMutator';

import { verifySpecification } from './mutatorAssertions';

verifySpecification(LogicalOperatorMutatorSpec, LogicalOperatorMutator);
