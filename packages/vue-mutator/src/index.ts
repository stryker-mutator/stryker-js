import VueMutator from './VueMutator';
import { declareFactoryPlugin, PluginKind, Injector, OptionsContext, tokens, COMMON_TOKENS } from '@stryker-mutator/api/plugin';
import { mutatorsFactory, MUTATORS_TOKEN } from './helpers/MutatorHelpers';

export const STRYKER_PLUGINS = [
  declareFactoryPlugin(PluginKind.Mutator, 'vue', vueMutatorFactory)
];

function vueMutatorFactory(injector: Injector<OptionsContext>) {
  return injector
    .provideFactory(MUTATORS_TOKEN, mutatorsFactory)
    .injectClass(VueMutator);
}
vueMutatorFactory.inject = tokens(COMMON_TOKENS.injector);
