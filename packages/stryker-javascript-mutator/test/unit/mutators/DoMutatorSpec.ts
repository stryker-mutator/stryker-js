import DoStatementMutator from '../../../src/mutators/DoStatementMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { DoStatementMutatorSpec } from 'stryker-mutator-specification/src/index';

verifySpecification(DoStatementMutatorSpec, DoStatementMutator);