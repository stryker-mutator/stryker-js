import { getLogger } from 'stryker-api/logging';
import { HttpClient } from 'typed-rest-client/HttpClient';
import { errorToString } from '../../utils/objectUtils';

export interface StrykerDashboardReport {
  apiKey: string;
  repositorySlug: string;
  branch: string;
  mutationScore: number;
}

const URL_STRYKER_DASHBOARD_REPORTER = 'https://dashboard.stryker-mutator.io/api/reports';

export default class DashboardReporterClient {

  private readonly log = getLogger(DashboardReporterClient.name);

  constructor(
    private readonly dashboardReporterClient = new HttpClient('stryker-dashboard-reporter')) {
  }

  public postStrykerDashboardReport(report: StrykerDashboardReport): Promise<void> {
    this.log.info(`Posting report to ${URL_STRYKER_DASHBOARD_REPORTER}`);
    const reportString = JSON.stringify(report);
    this.log.debug('Posting data %s', reportString);
    return this.dashboardReporterClient.post(URL_STRYKER_DASHBOARD_REPORTER, reportString,
    {
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
