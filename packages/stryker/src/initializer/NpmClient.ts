import { getLogger } from 'stryker-api/logging';
import { IRestResponse, RestClient } from 'typed-rest-client/RestClient';
import { errorToString } from '../utils/objectUtils';
import PromptOption from './PromptOption';

interface NpmSearchPackageInfo {
  package: {
    keywords: string[];
    name: string;
  };
}
interface NpmSearchResult {
  results: NpmSearchPackageInfo[];
  total: number;
}

interface NpmPackage {
  initStrykerConfig?: object;
  name: string;
}

const BASE_NPM_SEARCH = 'https://api.npms.io';
const BASE_NPM_PACKAGE = 'https://registry.npmjs.org';

const getName = (packageName: string) => {
  return packageName.split('-')[1];
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

  private readonly log = getLogger(NpmClient.name);

  constructor(
    private readonly searchClient = new RestClient('npmSearch', BASE_NPM_SEARCH),
    private readonly packageClient = new RestClient('npm', BASE_NPM_PACKAGE)) {
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

  public getMutatorOptions(): Promise<PromptOption[]> {
    return this.search('/v2/search?q=keywords:stryker-mutator')
    .then(mapSearchResultToPromptOption);
  }

  public getTestFrameworkOptions(testRunnerFilter: string | null): Promise<PromptOption[]> {
    return this.search('/v2/search?q=keywords:stryker-test-framework')
      .then(searchResult => {
        if (testRunnerFilter) {
          searchResult.results = searchResult.results.filter(framework => framework.package.keywords.indexOf(testRunnerFilter) >= 0);
        }

        return searchResult;
      })
      .then(mapSearchResultToPromptOption);
  }

  public getTestReporterOptions(): Promise<PromptOption[]> {
    return this.search(`/v2/search?q=keywords:stryker-reporter`)
      .then(mapSearchResultToPromptOption);
  }

  public getTestRunnerOptions(): Promise<PromptOption[]> {
    return this.search('/v2/search?q=keywords:stryker-test-runner')
      .then(mapSearchResultToPromptOption);
  }

  public getTranspilerOptions(): Promise<PromptOption[]> {
    return this.search('/v2/search?q=keywords:stryker-transpiler')
    .then(mapSearchResultToPromptOption);
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
