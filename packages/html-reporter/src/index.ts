import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';
import HtmlReporter from './HtmlReporter';

export const strykerPlugins = [declareClassPlugin(PluginKind.Reporter, 'html', HtmlReporter)];
