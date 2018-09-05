import SwitchStatementMutator from '../../../src/mutators/SwitchStatementMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { SwitchStatementMutatorSpec } from 'stryker-mutator-specification/src/index';

verifySpecification(SwitchStatementMutatorSpec, SwitchStatementMutator);
