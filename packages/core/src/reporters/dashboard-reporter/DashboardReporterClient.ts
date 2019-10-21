import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { mutationTestReportSchema } from '@stryker-mutator/api/report';
import { errorToString, StrykerError } from '@stryker-mutator/util';
import { HttpClient } from 'typed-rest-client/HttpClient';
import { isOK } from '../../utils/netUtils';
import { dashboardReporterTokens } from './tokens';

export interface MutationScoreReport {
  apiKey: string;
  repositorySlug: string;
  branch: string;
  mutationScore: number;
}

interface FullReport {
  result: mutationTestReportSchema.MutationTestResult;
}

interface FullReportResponse {
  href: string;
}

const URL_STRYKER_DASHBOARD_REPORTER = 'https://dashboard.stryker-mutator.io/api/reports';

export default class DashboardReporterClient {
  public static inject = tokens(commonTokens.logger, dashboardReporterTokens.httpClient);
  constructor(private readonly log: Logger, private readonly httpClient: HttpClient) {}

  public postMutationScoreReport(report: MutationScoreReport): Promise<void> {
    this.log.info(`Posting report to ${URL_STRYKER_DASHBOARD_REPORTER}`);
    const reportString = JSON.stringify(report);
    this.log.debug('Posting data %s', reportString);
    return this.httpClient
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

  public async putFullResult({
    report,
    repositorySlug,
    apiKey,
    version,
    moduleName
  }: {
    report: mutationTestReportSchema.MutationTestResult;
    repositorySlug: string;
    version: string;
    apiKey: string;
    moduleName: string | null;
  }): Promise<string> {
    const url = getPutUrl(repositorySlug, version, moduleName);
    const requestBody: FullReport = {
      result: report
    };
    const serializedBody = JSON.stringify(requestBody);
    this.log.info('PUT report to %s (~%s bytes)', url, serializedBody.length);
    this.log.debug('PUT report %s', serializedBody);
    const result = await this.httpClient.put(url, serializedBody, {
      ['X-Api-Key']: apiKey,
      ['Content-Type']: 'application/json'
    });
    const responseBody = await result.readBody();
    if (isOK(result.message.statusCode || 0)) {
      const response: FullReportResponse = JSON.parse(responseBody);
      return response.href;
    } else if (result.message.statusCode === 401) {
      throw new StrykerError(
        `Error HTTP PUT ${url}. Unauthorized. Did you provide the correct api key in the "STRYKER_DASHBOARD_API_KEY" environment variable?`
      );
    } else {
      throw new StrykerError(`Error HTTP PUT ${url}. Response status code: ${result.message.statusCode}. Response body: ${responseBody}`);
    }
  }
}

function getPutUrl(repoSlug: string, version: string, moduleName: string | null) {
  const base = `${URL_STRYKER_DASHBOARD_REPORTER}/${repoSlug}/${version}`;
  if (moduleName) {
    return `${base}?module=${encodeURIComponent(moduleName)}`;
  } else {
    return base;
  }
}
