import { MutatorFactory } from 'stryker-api/mutant';
import ES6Mutator from './ES6Mutator';
require('./mutators');

MutatorFactory.instance().register('es6', ES6Mutator);