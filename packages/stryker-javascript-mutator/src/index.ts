import { MutatorFactory } from 'stryker-api/mutant';
import JavaScriptMutator from './JavaScriptMutator';
require('./mutators');

MutatorFactory.instance().register('javascript', JavaScriptMutator);