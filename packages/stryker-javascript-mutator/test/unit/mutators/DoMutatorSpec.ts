import { DoStatementMutatorSpec } from 'stryker-mutator-specification/src/index';
import DoStatementMutator from '../../../src/mutators/DoStatementMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(DoStatementMutatorSpec, DoStatementMutator);
