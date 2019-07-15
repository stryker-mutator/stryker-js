import { PluginKind, Injector, TranspilerPluginContext, tokens, COMMON_TOKENS, declareFactoryPlugin } from '@stryker-mutator/api/plugin';
import WebpackTranspiler from './WebpackTranspiler';
import ConfigLoader from './compiler/ConfigLoader';
import { PLUGIN_TOKENS } from './pluginTokens';

export const STRYKER_PLUGINS = [
  declareFactoryPlugin(PluginKind.Transpiler, 'webpack', webpackTranspilerFactory)
];

function webpackTranspilerFactory(injector: Injector<TranspilerPluginContext>) {
  return injector
    .provideValue(PLUGIN_TOKENS.require, require)
    .provideClass(PLUGIN_TOKENS.configLoader, ConfigLoader)
    .injectClass(WebpackTranspiler);
}
webpackTranspilerFactory.inject = tokens(COMMON_TOKENS.injector);
