import ObjectMutator from '../../../src/mutators/ObjectMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { ObjectMutatorSpec } from 'stryker-mutator-specification/src/index';

verifySpecification(ObjectMutatorSpec, ObjectMutator);
