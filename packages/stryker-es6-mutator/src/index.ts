import { MutatorFactory } from 'stryker-api/mutant';
import registerNodeMutators from './mutators';
import ES6Mutator from './ES6Mutator';

registerNodeMutators();
MutatorFactory.instance().register('es6', ES6Mutator);