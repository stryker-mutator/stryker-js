import { ForStatementMutatorSpec } from 'stryker-mutator-specification/src/index';
import ForStatementMutator from '../../../src/mutator/ForStatementMutator';
import { verifySpecification } from './mutatorAssertions';

verifySpecification(ForStatementMutatorSpec, ForStatementMutator);
