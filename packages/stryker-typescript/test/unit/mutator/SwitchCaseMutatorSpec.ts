import SwitchCaseMutator from '../../../src/mutator/SwitchCaseMutator';
import { verifySpecification } from './mutatorAssertions';
import SwitchCaseMutatorSpec from 'stryker-mutator-specification/src/SwitchCaseMutatorSpec';

verifySpecification(SwitchCaseMutatorSpec, SwitchCaseMutator);
