import { StringLiteralMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';
import StringLiteralMutator from '../../../src/mutators/StringLiteralMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(StringLiteralMutatorSpec, StringLiteralMutator);
