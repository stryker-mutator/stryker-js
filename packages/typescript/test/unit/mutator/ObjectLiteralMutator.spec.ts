import ObjectLiteralMutatorSpec from '@stryker-mutator/mutator-specification/src/ObjectLiteralMutatorSpec';
import ObjectLiteralMutator from '../../../src/mutator/ObjectLiteralMutator';
import { verifySpecification } from './mutatorAssertions';

verifySpecification(ObjectLiteralMutatorSpec, ObjectLiteralMutator);
