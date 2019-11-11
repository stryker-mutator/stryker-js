import { commonTokens, Injector, OptionsContext, tokens } from '@stryker-mutator/api/plugin';
import { HttpClient } from 'typed-rest-client/HttpClient';

import DashboardReporter from './DashboardReporter';
import DashboardReporterClient from './DashboardReporterClient';
import { dashboardReporterTokens } from './tokens';

export function dashboardReporterFactory(injector: Injector<OptionsContext>) {
  return injector
    .provideValue(dashboardReporterTokens.httpClient, new HttpClient('stryker-dashboard-reporter'))
    .provideClass(dashboardReporterTokens.dashboardReporterClient, DashboardReporterClient)
    .injectClass(DashboardReporter);
}
dashboardReporterFactory.inject = tokens(commonTokens.injector);
