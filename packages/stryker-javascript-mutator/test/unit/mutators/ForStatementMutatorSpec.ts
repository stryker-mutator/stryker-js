import ForStatementMutator from '../../../src/mutators/ForStatementMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { ForStatementMutatorSpec } from 'stryker-mutator-specification/src/index';

verifySpecification(ForStatementMutatorSpec, ForStatementMutator);
