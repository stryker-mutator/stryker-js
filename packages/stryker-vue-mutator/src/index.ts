import VueMutator from './VueMutator';
import { declareFactoryPlugin, PluginKind, Injector, OptionsContext, tokens, commonTokens } from 'stryker-api/plugin';
import { mutatorsFactory, MUTATORS_TOKEN } from './helpers/MutatorHelpers';

export const strykerPlugins = [
  declareFactoryPlugin(PluginKind.Mutator, 'vue', vueMutatorFactory)
];

function vueMutatorFactory(injector: Injector<OptionsContext>) {
  return injector
    .provideFactory(MUTATORS_TOKEN, mutatorsFactory)
    .injectClass(VueMutator);
}
vueMutatorFactory.inject = tokens(commonTokens.injector);
