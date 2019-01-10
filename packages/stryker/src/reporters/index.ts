import ClearTextReporter from './ClearTextReporter';
import ProgressReporter from './ProgressReporter';
import ProgressAppendOnlyReporter from './ProgressAppendOnlyReporter';
import DotsReporter from './DotsReporter';
import EventRecorderReporter from './EventRecorderReporter';
import DashboardReporter from './DashboardReporter';
import { PluginKind, pluginClass } from 'stryker-api/plugin';

export const strykerPlugins = [
  pluginClass(PluginKind.Reporter, 'clear-text', ClearTextReporter),
  pluginClass(PluginKind.Reporter, 'progress', ProgressReporter),
  pluginClass(PluginKind.Reporter, 'progress-append-only', ProgressAppendOnlyReporter),
  pluginClass(PluginKind.Reporter, 'dots', DotsReporter),
  pluginClass(PluginKind.Reporter, 'event-recorder', EventRecorderReporter),
  pluginClass(PluginKind.Reporter, 'dashboard', DashboardReporter)
];
