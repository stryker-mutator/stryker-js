import { ObjectLiteralMutatorSpec } from 'stryker-mutator-specification/src/index';
import ObjectLiteralMutator from '../../../src/mutators/ObjectLiteralMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(ObjectLiteralMutatorSpec, ObjectLiteralMutator);
