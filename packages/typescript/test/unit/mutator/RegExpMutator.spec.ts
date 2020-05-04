import { RegExpMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

import RegExpMutator from '../../../src/mutator/RegExpMutator';

import { verifySpecification } from './mutatorAssertions';

verifySpecification(RegExpMutatorSpec, RegExpMutator);
