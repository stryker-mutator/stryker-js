import UnaryNotMutator from '../../../src/mutator/UnaryNotMutator';
import { verifySpecification } from './mutatorAssertions';
import UnaryNotMutatorSpec from 'stryker-mutator-specification/src/UnaryNotMutatorSpec';

verifySpecification(UnaryNotMutatorSpec, UnaryNotMutator);
