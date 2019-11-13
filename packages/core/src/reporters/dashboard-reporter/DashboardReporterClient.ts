import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { errorToString } from '@stryker-mutator/util';
import { HttpClient } from 'typed-rest-client/HttpClient';

import { dashboardReporterTokens } from './tokens';

export interface StrykerDashboardReport {
  apiKey: string;
  repositorySlug: string;
  branch: string;
  mutationScore: number;
}

const URL_STRYKER_DASHBOARD_REPORTER = 'https://dashboard.stryker-mutator.io/api/reports';

export default class DashboardReporterClient {
  public static inject = tokens(commonTokens.logger, dashboardReporterTokens.httpClient);
  constructor(private readonly log: Logger, private readonly dashboardReporterClient: HttpClient) {}

  public postStrykerDashboardReport(report: StrykerDashboardReport): Promise<void> {
    this.log.info(`Posting report to ${URL_STRYKER_DASHBOARD_REPORTER}`);
    const reportString = JSON.stringify(report);
    this.log.debug('Posting data %s', reportString);
    return this.dashboardReporterClient
      .post(URL_STRYKER_DASHBOARD_REPORTER, reportString, {
        ['Content-Type']: 'application/json'
      })
      .then(body => {
        const statusCode = body.message.statusCode;
        if (statusCode !== 201) {
          this.log.error(`Post to ${URL_STRYKER_DASHBOARD_REPORTER} resulted in http status code: ${statusCode}.`);
        }
      })
      .catch(err => {
        this.log.error(`Unable to reach ${URL_STRYKER_DASHBOARD_REPORTER}. Please check your internet connection.`, errorToString(err));
      });
  }
}
