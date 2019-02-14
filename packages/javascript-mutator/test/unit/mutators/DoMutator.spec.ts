import DoStatementMutator from '../../../src/mutators/DoStatementMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { DoStatementMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

verifySpecification(DoStatementMutatorSpec, DoStatementMutator);
