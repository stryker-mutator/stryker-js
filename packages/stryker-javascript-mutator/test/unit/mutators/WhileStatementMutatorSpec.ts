import WhileStatementMutator from '../../../src/mutators/WhileStatementMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { WhileStatementMutatorSpec } from 'stryker-mutator-specification/src/index';
import JavaScriptMutator from '../../../src/JavaScriptMutator';

verifySpecification(WhileStatementMutatorSpec, WhileStatementMutator);