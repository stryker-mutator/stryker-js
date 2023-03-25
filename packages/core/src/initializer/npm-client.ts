import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { errorToString } from '@stryker-mutator/util';
import { IRestResponse, RestClient } from 'typed-rest-client/RestClient';

import { PackageInfo } from './package-info.js';
import { PromptOption } from './prompt-option.js';

import { initializerTokens } from './index.js';

interface NpmSearchResult {
  total: number;
  results: Array<{ package: PackageInfo }>;
}

export interface NpmPackage {
  name: string;
  homepage?: string;
  initStrykerConfig?: Record<string, unknown>;
}

const getName = (packageName: string) => {
  return packageName.replace('@stryker-mutator/', '').replace('stryker-', '').split('-')[0];
};

const mapSearchResultToPromptOption = (searchResults: NpmSearchResult): PromptOption[] =>
  searchResults.results.map((result) => ({
    name: getName(result.package.name),
    pkg: result.package,
  }));

const handleResult =
  (from: string) =>
  <T>(response: IRestResponse<T>): T => {
    if (response.statusCode === 200 && response.result) {
      return response.result;
    } else {
      throw new Error(`Path ${from} resulted in http status code: ${response.statusCode}.`);
    }
  };

export class NpmClient {
  public static inject = tokens(commonTokens.logger, initializerTokens.restClientNpmSearch, initializerTokens.restClientNpm);
  constructor(private readonly log: Logger, private readonly searchClient: RestClient, private readonly packageClient: RestClient) {}

  public getTestRunnerOptions(): Promise<PromptOption[]> {
    return this.search('/v2/search?q=keywords:@stryker-mutator/test-runner-plugin').then(mapSearchResultToPromptOption);
  }

  public getTestReporterOptions(): Promise<PromptOption[]> {
    return this.search('/v2/search?q=keywords:@stryker-mutator/reporter-plugin').then(mapSearchResultToPromptOption);
  }

  public getAdditionalConfig(pkgInfo: PackageInfo): Promise<NpmPackage> {
    const path = `/${pkgInfo.name}@${pkgInfo.version}/package.json`;
    return this.packageClient
      .get<NpmPackage>(path)
      .then(handleResult(path))
      .catch((err) => {
        this.log.warn(
          `Could not fetch additional initialization config for dependency ${pkgInfo.name}. You might need to configure it manually`,
          err
        );
        return { name: pkgInfo.name };
      });
  }

  private search(path: string): Promise<NpmSearchResult> {
    this.log.debug(`Searching: ${path}`);
    return this.searchClient
      .get<NpmSearchResult>(path)
      .then(handleResult(path))
      .catch((err) => {
        this.log.error(`Unable to reach npms.io (for query ${path}). Please check your internet connection.`, errorToString(err));
        const result: NpmSearchResult = {
          results: [],
          total: 0,
        };
        return result;
      });
  }
}
