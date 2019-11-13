import { commonTokens, declareFactoryPlugin, Injector, OptionsContext, PluginKind, tokens } from '@stryker-mutator/api/plugin';

import { MUTATORS_TOKEN, mutatorsFactory } from './helpers/MutatorHelpers';
import VueMutator from './VueMutator';

export const strykerPlugins = [declareFactoryPlugin(PluginKind.Mutator, 'vue', vueMutatorFactory)];

function vueMutatorFactory(injector: Injector<OptionsContext>) {
  return injector.provideFactory(MUTATORS_TOKEN, mutatorsFactory).injectClass(VueMutator);
}
vueMutatorFactory.inject = tokens(commonTokens.injector);
