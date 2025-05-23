import {
  declareClassPlugin,
  declareFactoryPlugin,
  PluginKind,
} from '@stryker-mutator/api/plugin';

import { ClearTextReporter } from './clear-text-reporter.js';
import { dashboardReporterFactory } from './dashboard-reporter/index.js';
import { DotsReporter } from './dots-reporter.js';
import { EventRecorderReporter } from './event-recorder-reporter.js';
import { ProgressAppendOnlyReporter } from './progress-append-only-reporter.js';
import { ProgressBarReporter } from './progress-reporter.js';
import { HtmlReporter } from './html-reporter.js';
import { JsonReporter } from './json-reporter.js';

export { BroadcastReporter } from './broadcast-reporter.js';
export type { StrictReporter } from './strict-reporter.js';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.Reporter, 'clear-text', ClearTextReporter),
  declareClassPlugin(PluginKind.Reporter, 'progress', ProgressBarReporter),
  declareClassPlugin(
    PluginKind.Reporter,
    'progress-append-only',
    ProgressAppendOnlyReporter,
  ),
  declareClassPlugin(PluginKind.Reporter, 'dots', DotsReporter),
  declareClassPlugin(
    PluginKind.Reporter,
    'event-recorder',
    EventRecorderReporter,
  ),
  declareClassPlugin(PluginKind.Reporter, 'html', HtmlReporter),
  declareClassPlugin(PluginKind.Reporter, 'json', JsonReporter),
  declareFactoryPlugin(
    PluginKind.Reporter,
    'dashboard',
    dashboardReporterFactory,
  ),
];

export const reporterPluginsFileUrl = import.meta.url;
