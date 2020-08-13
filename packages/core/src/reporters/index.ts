import { declareClassPlugin, declareFactoryPlugin, PluginKind } from '@stryker-mutator/api/plugin';

import { ClearTextReporter } from './ClearTextReporter';
import { dashboardReporterFactory } from './dashboard-reporter';
import { DotsReporter } from './DotsReporter';
import { EventRecorderReporter } from './EventRecorderReporter';
import { ProgressAppendOnlyReporter } from './ProgressAppendOnlyReporter';
import { ProgressReporter } from './ProgressReporter';
import { HtmlReporter } from './html/HtmlReporter';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.Reporter, 'clear-text', ClearTextReporter),
  declareClassPlugin(PluginKind.Reporter, 'progress', ProgressReporter),
  declareClassPlugin(PluginKind.Reporter, 'progress-append-only', ProgressAppendOnlyReporter),
  declareClassPlugin(PluginKind.Reporter, 'dots', DotsReporter),
  declareClassPlugin(PluginKind.Reporter, 'event-recorder', EventRecorderReporter),
  declareClassPlugin(PluginKind.Reporter, 'html', HtmlReporter),
  declareFactoryPlugin(PluginKind.Reporter, 'dashboard', dashboardReporterFactory),
];
