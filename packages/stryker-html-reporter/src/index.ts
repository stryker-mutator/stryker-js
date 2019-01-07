import HtmlReporter from './HtmlReporter';
import { PluginKind } from 'stryker-api/di';
import { reporterPlugin } from 'stryker-api/report';

export const strykerPlugins = [reporterPlugin({
  injectable: HtmlReporter,
  kind: PluginKind.Reporter,
  name: 'html'
})];
