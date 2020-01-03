import UpdateOperatorMutatorSpec from '@stryker-mutator/mutator-specification/src/UpdateOperatorMutatorSpec';

import UpdateOperatorMutator from '../../../src/mutator/UpdateOperatorMutator';

import { verifySpecification } from './mutatorAssertions';

verifySpecification(UpdateOperatorMutatorSpec, UpdateOperatorMutator);
