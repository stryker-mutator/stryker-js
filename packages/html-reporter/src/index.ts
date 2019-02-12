import HtmlReporter from './HtmlReporter';
import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.Reporter, 'html', HtmlReporter)
];
