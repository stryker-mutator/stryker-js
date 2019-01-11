import ClearTextReporter from './ClearTextReporter';
import ProgressReporter from './ProgressReporter';
import ProgressAppendOnlyReporter from './ProgressAppendOnlyReporter';
import DotsReporter from './DotsReporter';
import EventRecorderReporter from './EventRecorderReporter';
import DashboardReporter from './DashboardReporter';
import { PluginKind, declareClassPlugin } from 'stryker-api/plugin';

export const strykerPlugins = [
  declareClassPlugin(PluginKind.Reporter, 'clear-text', ClearTextReporter),
  declareClassPlugin(PluginKind.Reporter, 'progress', ProgressReporter),
  declareClassPlugin(PluginKind.Reporter, 'progress-append-only', ProgressAppendOnlyReporter),
  declareClassPlugin(PluginKind.Reporter, 'dots', DotsReporter),
  declareClassPlugin(PluginKind.Reporter, 'event-recorder', EventRecorderReporter),
  declareClassPlugin(PluginKind.Reporter, 'dashboard', DashboardReporter)
];
