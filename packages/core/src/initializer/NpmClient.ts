import { RestClient, IRestResponse } from 'typed-rest-client/RestClient';
import PromptOption from './PromptOption';
import { errorToString } from '@stryker-mutator/util';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { initializerTokens, BASE_NPM_SEARCH, BASE_NPM_PACKAGE } from '.';
import { Logger } from '@stryker-mutator/api/logging';

interface NpmSearchPackageInfo {
  package: {
    name: string;
    keywords: string[];
  };
}
interface NpmSearchResult {
  total: number;
  results: NpmSearchPackageInfo[];
}

interface NpmPackage {
  name: string;
  initStrykerConfig?: object;
}

const getName = (packageName: string) => {
  return packageName.replace('@stryker-mutator/', '')
    .replace('stryker-', '')
    .split('-')[0];
};

const mapSearchResultToPromptOption = (searchResults: NpmSearchResult): PromptOption[] => searchResults.results.map(result => ({
  name: getName(result.package.name),
  npm: result.package.name
}));

const handleResult = (from: string) => <T>(response: IRestResponse<T>): T => {
  if (response.statusCode === 200 && response.result) {
    return response.result;
  } else {
    throw new Error(`Query ${from} resulted in http status code: ${response.statusCode}.`);
  }
};

export default class NpmClient {

  public static inject = tokens(commonTokens.logger, initializerTokens.restClientNpmSearch, initializerTokens.restClientNpm);
  constructor(
    private readonly log: Logger,
    private readonly searchClient: RestClient,
    private readonly packageClient: RestClient) {
  }

  public getTestRunnerOptions(): Promise<PromptOption[]> {
    return this.search('/v2/search?q=keywords:stryker-mutator-plugin+test-runner-plugin')
      .then(mapSearchResultToPromptOption);
  }

  public getTestFrameworkOptions(testRunnerFilter: string | null): Promise<PromptOption[]> {
    return this.search('/v2/search?q=keywords:stryker-mutator-plugin+test-framework-plugin')
      .then(searchResult => {
        if (testRunnerFilter) {
          searchResult.results = searchResult.results.filter(framework => framework.package.keywords.indexOf(testRunnerFilter) >= 0);
        }
        return searchResult;
      })
      .then(mapSearchResultToPromptOption);
  }

  public getMutatorOptions(): Promise<PromptOption[]> {
    return this.search('/v2/search?q=keywords:stryker-mutator-plugin+mutator-plugin')
      .then(mapSearchResultToPromptOption);
  }

  public getTranspilerOptions(): Promise<PromptOption[]> {
    return this.search('/v2/search?q=keywords:stryker-mutator-plugin+transpiler-plugin')
      .then(mapSearchResultToPromptOption);
  }

  public getTestReporterOptions(): Promise<PromptOption[]> {
    return this.search(`/v2/search?q=keywords:stryker-mutator-plugin+reporter-plugin`)
      .then(mapSearchResultToPromptOption);
  }

  public getAdditionalConfig(packageName: string): Promise<object> {
    return this.packageClient.get<NpmPackage>(`/${packageName}/latest`)
      .then(handleResult(`${BASE_NPM_PACKAGE}/${packageName}`))
      .then(pkg => pkg.initStrykerConfig || {})
      .catch(err => {
        this.log.warn(`Could not fetch additional initialization config for dependency ${packageName}. You might need to configure it manually`, err);
        return {};
      });
  }

  private search(query: string): Promise<NpmSearchResult> {
    const call = BASE_NPM_SEARCH + query;
    this.log.debug(`Searching: ${call}`);
    return this.searchClient.get<NpmSearchResult>(query)
      .then(handleResult(call))
      .catch(err => {
        this.log.error(`Unable to reach ${BASE_NPM_SEARCH} (for query ${query}). Please check your internet connection.`, errorToString(err));
        const result: NpmSearchResult = {
          results: [],
          total: 0
        };
        return result;
      });
  }
}
