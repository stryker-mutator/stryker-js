import { JavaScriptMutator } from './JavaScriptMutator';
import { PluginKind, declareFactoryPlugin, commonTokens, tokens, Injector, OptionsContext } from '@stryker-mutator/api/plugin';
import { NODE_MUTATORS_TOKEN } from './mutators/NodeMutator';
import { nodeMutators } from './mutators';

export const strykerPlugins = [
  declareFactoryPlugin(PluginKind.Mutator, 'javascript', javaScriptMutatorFactory)
];

function javaScriptMutatorFactory(injector: Injector<OptionsContext>): JavaScriptMutator {
  return injector
    .provideValue(NODE_MUTATORS_TOKEN, nodeMutators)
    .injectClass(JavaScriptMutator);
}
javaScriptMutatorFactory.inject = tokens(commonTokens.injector);
