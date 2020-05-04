import { RegExpMutatorSpec } from '../../../../mutator-specification/src';
import RegExpMutator from '../../../src/mutator/RegExpMutator';

import { verifySpecification } from './mutatorAssertions';

verifySpecification(RegExpMutatorSpec, RegExpMutator);
