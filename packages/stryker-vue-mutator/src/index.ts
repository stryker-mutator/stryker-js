import { MutatorFactory } from 'stryker-api/mutant';
import VueMutator from './VueMutator';

MutatorFactory.instance().register('vue', VueMutator);
