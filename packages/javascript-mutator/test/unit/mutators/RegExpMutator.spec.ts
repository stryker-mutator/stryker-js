import { RegExpMutatorSpec } from '../../../../mutator-specification/src';
import RegExpMutator from '../../../src/mutators/RegExpMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(RegExpMutatorSpec, RegExpMutator);
