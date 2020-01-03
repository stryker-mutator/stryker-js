import { LogicalOperatorMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

import LogicalOperatorMutator from '../../../src/mutators/LogicalOperatorMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(LogicalOperatorMutatorSpec, LogicalOperatorMutator);
