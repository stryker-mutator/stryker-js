import StringLiteralMutator from '../../../src/mutators/StringLiteralMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { SwitchStatementMutatorSpec } from 'stryker-mutator-specification/src/index';

verifySpecification(SwitchStatementMutatorSpec, StringLiteralMutator);
