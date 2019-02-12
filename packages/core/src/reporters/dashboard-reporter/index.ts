import { OptionsContext, Injector, tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { HttpClient } from 'typed-rest-client/HttpClient';
import DashboardReporterClient from './DashboardReporterClient';
import DashboardReporter from './DashboardReporter';
import { dashboardReporterTokens } from './tokens';

export function dashboardReporterFactory(injector: Injector<OptionsContext>) {
  return injector
    .provideValue(dashboardReporterTokens.httpClient, new HttpClient('stryker-dashboard-reporter'))
    .provideClass(dashboardReporterTokens.dashboardReporterClient, DashboardReporterClient)
    .injectClass(DashboardReporter);
}
dashboardReporterFactory.inject = tokens(commonTokens.injector);
