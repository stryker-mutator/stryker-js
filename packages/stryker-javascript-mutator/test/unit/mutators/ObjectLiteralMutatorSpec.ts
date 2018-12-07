import ObjectLiteralMutator from '../../../src/mutators/ObjectLiteralMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { ObjectLiteralMutatorSpec } from 'stryker-mutator-specification/src/index';

verifySpecification(ObjectLiteralMutatorSpec, ObjectLiteralMutator);
