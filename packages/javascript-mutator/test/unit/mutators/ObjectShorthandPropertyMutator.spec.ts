import { ObjectShorthandPropertyMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

import ObjectShorthandPropertyMutator from '../../../src/mutators/ObjectShorthandPropertyMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(ObjectShorthandPropertyMutatorSpec, ObjectShorthandPropertyMutator);
