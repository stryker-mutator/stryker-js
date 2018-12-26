import { SwitchCaseMutatorSpec } from 'stryker-mutator-specification/src/index';
import SwitchCaseMutator from '../../../src/mutators/SwitchCaseMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';

verifySpecification(SwitchCaseMutatorSpec, SwitchCaseMutator);
