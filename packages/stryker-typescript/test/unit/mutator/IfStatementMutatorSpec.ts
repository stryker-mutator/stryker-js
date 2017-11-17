import IfStatementMutator from '../../../src/mutator/IfStatementMutator';
import { verifySpecification } from './mutatorAssertions';
import IfStatementMutatorSpec from 'stryker-mutator-specification/src/IfStatementMutatorSpec';

verifySpecification(IfStatementMutatorSpec, IfStatementMutator);
