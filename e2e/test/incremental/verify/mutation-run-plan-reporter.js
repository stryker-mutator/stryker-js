import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

export class MutationRunPlanReporter {
  /**
   * @type {import('@stryker-mutator/api/report').MutationTestingPlanReadyEvent}
   */
  event;
  /**
   * @type { MutationRunPlanReporter }
   */
  static instance;

  constructor() {
    MutationRunPlanReporter.instance = this;
  }

  /**
   * @param {import('@stryker-mutator/api/report').MutationTestingPlanReadyEvent} event
   * @returns {void}
   */
  onMutationTestingPlanReady(event) {
    this.event = event;
  }
}

export const strykerPlugins = [declareClassPlugin(PluginKind.Reporter, 'mutation-run-plan', MutationRunPlanReporter)];
