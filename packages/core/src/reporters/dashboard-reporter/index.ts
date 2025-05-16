import {
  commonTokens,
  Injector,
  PluginContext,
  tokens,
} from '@stryker-mutator/api/plugin';
import { HttpClient } from 'typed-rest-client/HttpClient.js';

import { determineCIProvider } from '../ci/provider.js';

import { DashboardReporter } from './dashboard-reporter.js';
import { DashboardReporterClient } from './dashboard-reporter-client.js';
import { dashboardReporterTokens } from './tokens.js';

export function dashboardReporterFactory(
  injector: Injector<PluginContext>,
): DashboardReporter {
  return injector
    .provideValue(
      dashboardReporterTokens.httpClient,
      new HttpClient('stryker-dashboard-reporter'),
    )
    .provideClass(
      dashboardReporterTokens.dashboardReporterClient,
      DashboardReporterClient,
    )
    .provideFactory(dashboardReporterTokens.ciProvider, determineCIProvider)
    .injectClass(DashboardReporter);
}
dashboardReporterFactory.inject = tokens(commonTokens.injector);
