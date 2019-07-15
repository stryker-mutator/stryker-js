import { HttpClient } from 'typed-rest-client/HttpClient';
import { errorToString } from '@stryker-mutator/util';
import { Logger } from '@stryker-mutator/api/logging';
import { tokens, COMMON_TOKENS } from '@stryker-mutator/api/plugin';
import { DASHBOARD_REPORTER_TOKENS } from './tokens';

export interface StrykerDashboardReport {
  apiKey: string;
  repositorySlug: string;
  branch: string;
  mutationScore: number;
}

const urlStrykerDashboardReporter = 'https://dashboard.stryker-mutator.io/api/reports';

export default class DashboardReporterClient {

  public static inject = tokens(COMMON_TOKENS.logger, DASHBOARD_REPORTER_TOKENS.httpClient);
  constructor(
    private readonly log: Logger,
    private readonly dashboardReporterClient: HttpClient) {
  }

  public postStrykerDashboardReport(report: StrykerDashboardReport): Promise<void> {
    this.log.info(`Posting report to ${urlStrykerDashboardReporter}`);
    const reportString = JSON.stringify(report);
    this.log.debug('Posting data %s', reportString);
    return this.dashboardReporterClient.post(urlStrykerDashboardReporter, reportString,
    {
      ['Content-Type']: 'application/json'
    })
      .then(body => {
        const statusCode = body.message.statusCode;
        if (statusCode !== 201) {
          this.log.error(`Post to ${urlStrykerDashboardReporter} resulted in http status code: ${statusCode}.`);
        }
      })
      .catch(err => {
        this.log.error(`Unable to reach ${urlStrykerDashboardReporter}. Please check your internet connection.`, errorToString(err));
      });
  }
}
