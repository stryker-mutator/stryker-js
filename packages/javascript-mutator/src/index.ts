import { JavaScriptMutator } from './JavaScriptMutator';
import { PluginKind, declareFactoryPlugin, COMMON_TOKENS, tokens, Injector, OptionsContext } from '@stryker-mutator/api/plugin';
import { NODE_MUTATORS_TOKEN } from './mutators/NodeMutator';
import { NODE_MUTATORS } from './mutators';

export const STRYKER_PLUGINS = [
  declareFactoryPlugin(PluginKind.Mutator, 'javascript', javaScriptMutatorFactory)
];

function javaScriptMutatorFactory(injector: Injector<OptionsContext>): JavaScriptMutator {
  return injector
    .provideValue(NODE_MUTATORS_TOKEN, NODE_MUTATORS)
    .injectClass(JavaScriptMutator);
}
javaScriptMutatorFactory.inject = tokens(COMMON_TOKENS.injector);
