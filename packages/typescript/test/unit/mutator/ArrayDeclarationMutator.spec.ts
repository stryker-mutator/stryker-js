import { ArrayDeclarationMutatorSpec } from '@stryker-mutator/mutator-specification';

import ArrayDeclarationMutator from '../../../src/mutator/ArrayDeclarationMutator';

import { verifySpecification } from './mutatorAssertions';

verifySpecification(ArrayDeclarationMutatorSpec, ArrayDeclarationMutator);
