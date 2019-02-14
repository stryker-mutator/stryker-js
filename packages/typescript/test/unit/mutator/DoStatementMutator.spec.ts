import DoStatementMutator from '../../../src/mutator/DoStatementMutator';
import { verifySpecification } from './mutatorAssertions';
import DoStatementMutatorSpec from '@stryker-mutator/mutator-specification/src/DoStatementMutatorSpec';

verifySpecification(DoStatementMutatorSpec, DoStatementMutator);
