import { commonTokens, declareFactoryPlugin, Injector, PluginKind, tokens, TranspilerPluginContext } from '@stryker-mutator/api/plugin';
import ConfigLoader from './compiler/ConfigLoader';
import { pluginTokens } from './pluginTokens';
import WebpackTranspiler from './WebpackTranspiler';

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
