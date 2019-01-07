import ClearTextReporter from './ClearTextReporter';
import ProgressReporter from './ProgressReporter';
import ProgressAppendOnlyReporter from './ProgressAppendOnlyReporter';
import DotsReporter from './DotsReporter';
import EventRecorderReporter from './EventRecorderReporter';
import DashboardReporter from './DashboardReporter';
import { reporterPlugin } from 'stryker-api/report';
import { PluginKind } from 'stryker-api/di';

export const strykerPlugins = [
  reporterPlugin({ name: 'clear-text', kind: PluginKind.Reporter, injectable: ClearTextReporter }),
  reporterPlugin({ name: 'progress', kind: PluginKind.Reporter, injectable: ProgressReporter }),
  reporterPlugin({ name: 'progress-append-only', kind: PluginKind.Reporter, injectable: ProgressAppendOnlyReporter }),
  reporterPlugin({ name: 'dots', kind: PluginKind.Reporter, injectable: DotsReporter }),
  reporterPlugin({ name: 'event-recorder', kind: PluginKind.Reporter, injectable: EventRecorderReporter }),
  reporterPlugin({ name: 'dashboard', kind: PluginKind.Reporter, injectable: DashboardReporter })
];
