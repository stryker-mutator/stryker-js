import HtmlReporter from './HtmlReporter';
import { PluginKind, pluginClass } from 'stryker-api/plugin';

export const strykerPlugins = [
  pluginClass(PluginKind.Reporter, 'html', HtmlReporter)
];
