import IfStatementMutator from '../../../src/mutators/IfStatementMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { IfStatementMutatorSpec } from 'stryker-mutator-specification/src/index';

verifySpecification(IfStatementMutatorSpec, IfStatementMutator);
