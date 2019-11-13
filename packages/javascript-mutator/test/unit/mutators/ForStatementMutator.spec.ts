import { ForStatementMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

import ForStatementMutator from '../../../src/mutators/ForStatementMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(ForStatementMutatorSpec, ForStatementMutator);
