import { commonTokens, Injector, OptionsContext, tokens } from '@stryker-mutator/api/plugin';
import { HttpClient } from 'typed-rest-client/HttpClient';

import { determineCIProvider } from '../ci/Provider';

import DashboardReporter from './DashboardReporter';
import DashboardReporterClient from './DashboardReporterClient';
import { dashboardReporterTokens } from './tokens';

export function dashboardReporterFactory(injector: Injector<OptionsContext>): DashboardReporter {
  return injector
    .provideValue(dashboardReporterTokens.httpClient, new HttpClient('stryker-dashboard-reporter'))
    .provideClass(dashboardReporterTokens.dashboardReporterClient, DashboardReporterClient)
    .provideFactory(dashboardReporterTokens.ciProvider, determineCIProvider)
    .injectClass(DashboardReporter);
}
dashboardReporterFactory.inject = tokens(commonTokens.injector);
