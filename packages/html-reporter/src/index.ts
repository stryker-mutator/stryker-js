import HtmlReporter from './HtmlReporter';
import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

export const STRYKER_PLUGINS = [
  declareClassPlugin(PluginKind.Reporter, 'html', HtmlReporter)
];
