import { declareClassPlugin, declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import { ClearTextReporter } from './clear-text-reporter';
import { dashboardReporterFactory } from './dashboard-reporter';
import { DotsReporter } from './dots-reporter';
import { EventRecorderReporter } from './event-recorder-reporter';
import { ProgressAppendOnlyReporter } from './progress-append-only-reporter';
import { ProgressBarReporter } from './progress-reporter';
import { HtmlReporter } from './html/html-reporter';
import { JsonReporter } from './json-reporter';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.Reporter, 'clear-text', ClearTextReporter),
  declareClassPlugin(PluginKind.Reporter, 'progress', ProgressBarReporter),
  declareClassPlugin(PluginKind.Reporter, 'progress-append-only', ProgressAppendOnlyReporter),
  declareClassPlugin(PluginKind.Reporter, 'dots', DotsReporter),
  declareClassPlugin(PluginKind.Reporter, 'event-recorder', EventRecorderReporter),
  declareClassPlugin(PluginKind.Reporter, 'html', HtmlReporter),
  declareClassPlugin(PluginKind.Reporter, 'json', JsonReporter),
  declareFactoryPlugin(PluginKind.Reporter, 'dashboard', dashboardReporterFactory),
];
