import ForStatementMutator from '../../../src/mutator/ForStatementMutator';
import { verifySpecification } from './mutatorAssertions';
import { ForStatementMutatorSpec } from 'stryker-mutator-specification/src/index';

verifySpecification(ForStatementMutatorSpec, ForStatementMutator);
