import { RestClient, IRestResponse } from 'typed-rest-client/RestClient';
import PromptOption from './PromptOption';
import * as log4js from 'log4js';
import { errorToString } from '../utils/objectUtils';

const log = log4js.getLogger('NpmClient');

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
  if (response.statusCode === 200) {
    return response.result;
  } else {
    throw new Error(`Query ${from} resulted in http status code: ${response.statusCode}.`);
  }
};

export default class NpmClient {

  constructor(
    private searchClient = new RestClient('npmSearch', BASE_NPM_SEARCH),
    private packageClient = new RestClient('npm', BASE_NPM_PACKAGE)) {
  }

  getTestRunnerOptions(): Promise<PromptOption[]> {
    return this.search('/v2/search?q=keywords:stryker-test-runner')
      .then(mapSearchResultToPromptOption);
  }

  getTestFrameworkOptions(testRunnerFilter: string | null): Promise<PromptOption[]> {
    return this.search('/v2/search?q=keywords:stryker-test-framework')
      .then(searchResult => {
        if (testRunnerFilter) {
          searchResult.results = searchResult.results.filter(framework => framework.package.keywords.indexOf(testRunnerFilter) >= 0);
        }
        return searchResult;
      })
      .then(mapSearchResultToPromptOption);
  }

  getTestReporterOptions(): Promise<PromptOption[]> {
    return this.search(`/v2/search?q=keywords:stryker-reporter`)
      .then(mapSearchResultToPromptOption);
  }

  getAdditionalConfig(packageName: string): Promise<object> {
    return this.packageClient.get<NpmPackage>(`/${packageName}/latest`)
      .then(handleResult(`${BASE_NPM_PACKAGE}/${packageName}`))
      .then(pkg => pkg.initStrykerConfig || {})
      .catch(err => {
        log.warn(`Could not fetch additional initialization config for dependency ${packageName}. You might need to configure it manually`, err);
        return {};
      });
  }

  private search(query: string): Promise<NpmSearchResult> {
    const call = BASE_NPM_SEARCH + query;
    log.debug(`Searching: ${call}`);
    return this.searchClient.get<NpmSearchResult>(query)
      .then(handleResult(call))
      .catch(err => {
        log.error(`Unable to reach ${BASE_NPM_SEARCH} (for query ${query}). Please check your internet connection.`, errorToString(err));
        const result: NpmSearchResult = {
          total: 0,
          results: []
        };
        return result;
      });
  }
}