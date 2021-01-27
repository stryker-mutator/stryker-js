import { commonTokens, Injector, PluginContext, tokens } from '@stryker-mutator/api/plugin';
import { HttpClient } from 'typed-rest-client/HttpClient';

import { determineCIProvider } from '../ci/provider';

import { DashboardReporter } from './dashboard-reporter';
import { DashboardReporterClient } from './dashboard-reporter-client';
import { dashboardReporterTokens } from './tokens';

export function dashboardReporterFactory(injector: Injector<PluginContext>): DashboardReporter {
  return injector
    .provideValue(dashboardReporterTokens.httpClient, new HttpClient('stryker-dashboard-reporter'))
    .provideClass(dashboardReporterTokens.dashboardReporterClient, DashboardReporterClient)
    .provideFactory(dashboardReporterTokens.ciProvider, determineCIProvider)
    .injectClass(DashboardReporter);
}
dashboardReporterFactory.inject = tokens(commonTokens.injector);
