import StringLiteralMutator from '../../../src/mutators/StringLiteralMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { StringLiteralMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

verifySpecification(StringLiteralMutatorSpec, StringLiteralMutator);
