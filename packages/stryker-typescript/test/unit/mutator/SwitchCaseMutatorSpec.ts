import SwitchCaseMutatorSpec from 'stryker-mutator-specification/src/SwitchCaseMutatorSpec';
import SwitchCaseMutator from '../../../src/mutator/SwitchCaseMutator';
import { verifySpecification } from './mutatorAssertions';

verifySpecification(SwitchCaseMutatorSpec, SwitchCaseMutator);
