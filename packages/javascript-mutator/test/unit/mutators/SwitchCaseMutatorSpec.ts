import SwitchCaseMutator from '../../../src/mutators/SwitchCaseMutator';
import { verifySpecification } from '../../helpers/mutatorAssertions';
import { SwitchCaseMutatorSpec } from '@stryker-mutator/mutator-specification/src/index';

verifySpecification(SwitchCaseMutatorSpec, SwitchCaseMutator);
