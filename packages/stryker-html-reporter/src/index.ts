import HtmlReporter from './HtmlReporter';
import { PluginKind, reporterPlugin } from 'stryker-api/plugin';

export const strykerPlugins = [
  reporterPlugin({
    injectable: HtmlReporter,
    kind: PluginKind.Reporter,
    name: 'html'
  })
];
