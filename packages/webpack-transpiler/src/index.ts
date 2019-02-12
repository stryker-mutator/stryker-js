import { PluginKind, Injector, TranspilerPluginContext, tokens, commonTokens, declareFactoryPlugin } from '@stryker-mutator/api/plugin';
import WebpackTranspiler from './WebpackTranspiler';
import ConfigLoader from './compiler/ConfigLoader';
import { pluginTokens } from './pluginTokens';

export const strykerPlugins = [
  declareFactoryPlugin(PluginKind.Transpiler, 'webpack', webpackTranspilerFactory)
];

function webpackTranspilerFactory(injector: Injector<TranspilerPluginContext>) {
  return injector
    .provideValue(pluginTokens.require, require)
    .provideClass(pluginTokens.configLoader, ConfigLoader)
    .injectClass(WebpackTranspiler);
}
webpackTranspilerFactory.inject = tokens(commonTokens.injector);
