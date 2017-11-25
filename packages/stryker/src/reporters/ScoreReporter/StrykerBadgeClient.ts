import { getLogger } from 'log4js';
import { HttpClient } from 'typed-rest-client/HttpClient';
import { errorToString } from '../../utils/objectUtils';

export interface StrykerBadgeReport {
  api_key: string;
  repository_slug: string;
  branch: string;
  mutation_score: number;
  report_data: any;
}

const URL_STRYKER_BADGE_REPORTER = 'https://stryker-mutator-badge.azurewebsites.net/';

export default class BadgeClient {

  private readonly log = getLogger(BadgeClient.name);

  constructor(
    private badgeClient = new HttpClient('stryker-batch-reporter')) {
  }

  postStrykerBadgeReport(report: StrykerBadgeReport): Promise<void> {
    this.log.debug(`Posting badge report to ${URL_STRYKER_BADGE_REPORTER}`);
    return this.badgeClient.post(URL_STRYKER_BADGE_REPORTER, JSON.stringify(report), 
    {
      ['Content-Type']: 'application/json'
    })
      .then(body => {
        const statusCode = body.message.statusCode;
        if (statusCode !== 201) {
          this.log.error(`Post to ${URL_STRYKER_BADGE_REPORTER} resulted in http status code: ${statusCode}.`);          
        }
      })
      .catch(err => {
        this.log.error(`Unable to reach ${URL_STRYKER_BADGE_REPORTER}. Please check your internet connection.`, errorToString(err));
      });
  }
}