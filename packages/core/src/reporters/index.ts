import ClearTextReporter from './ClearTextReporter';
import ProgressReporter from './ProgressReporter';
import ProgressAppendOnlyReporter from './ProgressAppendOnlyReporter';
import DotsReporter from './DotsReporter';
import EventRecorderReporter from './EventRecorderReporter';
import { PluginKind, declareClassPlugin, declareFactoryPlugin } from '@stryker-mutator/api/plugin';
import { dashboardReporterFactory } from './dashboard-reporter';

export const STRYKER_PLUGINS = [
  declareClassPlugin(PluginKind.Reporter, 'clear-text', ClearTextReporter),
  declareClassPlugin(PluginKind.Reporter, 'progress', ProgressReporter),
  declareClassPlugin(PluginKind.Reporter, 'progress-append-only', ProgressAppendOnlyReporter),
  declareClassPlugin(PluginKind.Reporter, 'dots', DotsReporter),
  declareClassPlugin(PluginKind.Reporter, 'event-recorder', EventRecorderReporter),
  declareFactoryPlugin(PluginKind.Reporter, 'dashboard', dashboardReporterFactory)
];
