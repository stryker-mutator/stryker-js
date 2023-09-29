import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { errorToString } from '@stryker-mutator/util';
import type { IRestResponse, RestClient } from 'typed-rest-client/RestClient.js';

import { PackageInfo, PackageSummary } from './package-info.js';
import { PromptOption } from './prompt-option.js';

import { initializerTokens } from './index.js';

export interface NpmSearchResult {
  total: number;
  objects: Array<{ package: PackageSummary }>;
}

const getName = (packageName: string) => {
  return packageName.replace('@stryker-mutator/', '').replace('stryker-', '').split('-')[0];
};

const mapSearchResultToPromptOption = (searchResults: NpmSearchResult): PromptOption[] =>
  searchResults.objects.map((result) => ({
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
  public static inject = tokens(commonTokens.logger, initializerTokens.restClientNpm);
  constructor(
    private readonly log: Logger,
    private readonly innerNpmClient: RestClient,
  ) {}

  public getTestRunnerOptions(): Promise<PromptOption[]> {
    return this.search(`/-/v1/search?text=keywords:${encodeURIComponent('@stryker-mutator/test-runner-plugin')}`).then(mapSearchResultToPromptOption);
  }

  public getTestReporterOptions(): Promise<PromptOption[]> {
    return this.search(`/-/v1/search?text=keywords:${encodeURIComponent('@stryker-mutator/reporter-plugin')}`).then(mapSearchResultToPromptOption);
  }

  public getAdditionalConfig(pkgInfo: PackageSummary): Promise<PackageInfo> {
    const path = `/${encodeURIComponent(pkgInfo.name)}@${pkgInfo.version}`;
    return this.innerNpmClient
      .get<PackageInfo>(path)
      .then(handleResult(path))
      .catch((err) => {
        this.log.warn(
          `Could not fetch additional initialization config for dependency ${pkgInfo.name}. You might need to configure it manually`,
          err,
        );
        return pkgInfo;
      });
  }

  private search(path: string): Promise<NpmSearchResult> {
    this.log.debug(`Searching: ${path}`);
    return this.innerNpmClient
      .get<NpmSearchResult>(path)
      .then(handleResult(path))
      .catch((err) => {
        this.log.error(
          `Unable to reach 'https://registry.npmjs.com' (for query ${path}). Please check your internet connection.`,
          errorToString(err),
        );
        const result: NpmSearchResult = {
          objects: [],
          total: 0,
        };
        return result;
      });
  }
}
