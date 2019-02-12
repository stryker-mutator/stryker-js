import { verifySpecification } from './mutatorAssertions';
import ObjectLiteralMutator from '../../../src/mutator/ObjectLiteralMutator';
import ObjectLiteralMutatorSpec from '@stryker-mutator/mutator-specification/src/ObjectLiteralMutatorSpec';

verifySpecification(ObjectLiteralMutatorSpec, ObjectLiteralMutator);
