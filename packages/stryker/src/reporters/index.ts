import ClearTextReporter from './ClearTextReporter';
import ProgressReporter from './ProgressReporter';
import DotsReporter from './DotsReporter';
import EventRecorderReporter from './EventRecorderReporter';
import DashboardReporter from './DashboardReporter';
import { plugins } from 'stryker-api/di';

export const strykerPlugins = plugins(
  ClearTextReporter,
  ProgressReporter,
  DotsReporter,
  EventRecorderReporter,
  DashboardReporter
);
