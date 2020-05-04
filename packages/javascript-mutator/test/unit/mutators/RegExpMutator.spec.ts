import { RegExpMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

import RegExpMutator from '../../../src/mutators/RegExpMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(RegExpMutatorSpec, RegExpMutator);
