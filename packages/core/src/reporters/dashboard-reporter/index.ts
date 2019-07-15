import { OptionsContext, Injector, tokens, COMMON_TOKENS } from '@stryker-mutator/api/plugin';
import { HttpClient } from 'typed-rest-client/HttpClient';
import DashboardReporterClient from './DashboardReporterClient';
import DashboardReporter from './DashboardReporter';
import { DASHBOARD_REPORTER_TOKENS } from './tokens';

export function dashboardReporterFactory(injector: Injector<OptionsContext>) {
  return injector
    .provideValue(DASHBOARD_REPORTER_TOKENS.httpClient, new HttpClient('stryker-dashboard-reporter'))
    .provideClass(DASHBOARD_REPORTER_TOKENS.dashboardReporterClient, DashboardReporterClient)
    .injectClass(DashboardReporter);
}
dashboardReporterFactory.inject = tokens(COMMON_TOKENS.injector);
