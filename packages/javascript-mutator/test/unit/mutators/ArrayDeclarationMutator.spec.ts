import { ArrayDeclarationMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

import ArrayDeclarationMutator from '../../../src/mutators/ArrayDeclarationMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(ArrayDeclarationMutatorSpec, ArrayDeclarationMutator);
