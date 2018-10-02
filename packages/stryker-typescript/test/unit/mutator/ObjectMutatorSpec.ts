import { verifySpecification } from './mutatorAssertions';
import ObjectMutator from '../../../src/mutator/ObjectMutator';
import ObjectMutatorSpec from 'stryker-mutator-specification/src/ObjectMutatorSpec';

verifySpecification(ObjectMutatorSpec, ObjectMutator);
