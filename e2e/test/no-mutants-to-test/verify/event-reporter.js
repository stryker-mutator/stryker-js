import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

export class EventReporter {
  /**
   * @type {string[]}
   */
  static events = [];

  onDryRunCompleted() {
    EventReporter.events.push('onDryRunCompleted');
  }
  onMutationTestingPlanReady() {
    EventReporter.events.push('onMutationTestingPlanReady');
  }
  onMutationTestReportReady() {
    EventReporter.events.push('onMutationTestReportReady');
  }
  wrapUp() {
    EventReporter.events.push('wrapUp');
  }
}

export const strykerPlugins = [
  declareClassPlugin(PluginKind.Reporter, 'event', EventReporter),
];
