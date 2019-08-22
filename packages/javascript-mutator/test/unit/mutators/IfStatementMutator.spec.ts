import { IfStatementMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';
import IfStatementMutator from '../../../src/mutators/IfStatementMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(IfStatementMutatorSpec, IfStatementMutator);
