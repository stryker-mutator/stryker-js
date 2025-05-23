import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { StrykerError } from '@stryker-mutator/util';
import { HttpClient } from 'typed-rest-client/HttpClient.js';
import { StrykerOptions } from '@stryker-mutator/api/core';

import { objectUtils } from '../../utils/object-utils.js';

import { dashboardReporterTokens } from './tokens.js';
import { Report } from './report.js';

interface ReportResponseBody {
  href: string;
}

const STRYKER_DASHBOARD_API_KEY = 'STRYKER_DASHBOARD_API_KEY';

export class DashboardReporterClient {
  public static inject = tokens(
    commonTokens.logger,
    dashboardReporterTokens.httpClient,
    commonTokens.options,
  );
  constructor(
    private readonly log: Logger,
    private readonly httpClient: HttpClient,
    private readonly options: StrykerOptions,
  ) {}

  public async updateReport({
    report,
    projectName,
    version,
    moduleName,
  }: {
    report: Report;
    projectName: string;
    version: string;
    moduleName: string | undefined;
  }): Promise<string> {
    const url = this.getPutUrl(projectName, version, moduleName);
    const serializedBody = JSON.stringify(report);
    this.log.info('PUT report to %s (~%s bytes)', url, serializedBody.length);
    const apiKey = objectUtils.getEnvironmentVariable(
      STRYKER_DASHBOARD_API_KEY,
    );
    if (apiKey) {
      this.log.debug(
        'Using configured API key from environment "%s"',
        STRYKER_DASHBOARD_API_KEY,
      );
    }
    this.log.trace('PUT report %s', serializedBody);
    const result = await this.httpClient.put(url, serializedBody, {
      ['X-Api-Key']: apiKey,
      ['Content-Type']: 'application/json',
    });
    const responseBody = await result.readBody();
    if (isOK(result.message.statusCode ?? 0)) {
      const response: ReportResponseBody = JSON.parse(responseBody);
      return response.href;
    } else if (result.message.statusCode === 401) {
      throw new StrykerError(
        `Error HTTP PUT ${url}. Unauthorized. Did you provide the correct api key in the "${STRYKER_DASHBOARD_API_KEY}" environment variable?`,
      );
    } else {
      throw new StrykerError(
        `Error HTTP PUT ${url}. Response status code: ${result.message.statusCode}. Response body: ${responseBody}`,
      );
    }
  }

  private getPutUrl(
    repoSlug: string,
    version: string,
    moduleName: string | undefined,
  ) {
    const base = `${this.options.dashboard.baseUrl}/${repoSlug}/${encodeURIComponent(version)}`;
    if (moduleName) {
      return `${base}?module=${encodeURIComponent(moduleName)}`;
    } else {
      return base;
    }
  }
}

function isOK(statusCode: number): boolean {
  return statusCode >= 200 && statusCode < 300;
}
