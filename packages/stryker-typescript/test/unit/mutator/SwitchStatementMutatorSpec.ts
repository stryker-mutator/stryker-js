import SwitchStatementMutator from '../../../src/mutator/SwitchStatementMutator';
import { verifySpecification } from './mutatorAssertions';
import SwitchStatementMutatorSpec from 'stryker-mutator-specification/src/SwitchStatementMutatorSpec';

verifySpecification(SwitchStatementMutatorSpec, SwitchStatementMutator);
