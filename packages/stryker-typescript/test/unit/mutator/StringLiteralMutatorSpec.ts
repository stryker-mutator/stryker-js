import { verifySpecification } from './mutatorAssertions';
import StringLiteralMutator from '../../../src/mutator/StringLiteralMutator';
import StringLiteralMutatorSpec from 'stryker-mutator-specification/src/StringLiteralMutatorSpec';

verifySpecification(StringLiteralMutatorSpec, StringLiteralMutator);
