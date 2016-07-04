import {TestSelectorFactory, TestSelector} from 'stryker-api/test_selector';
import {StrykerOptions} from 'stryker-api/core';
import * as log4js from 'log4js';

const WARNING_RUNNING_WITHOUT_SELECTOR = 'Stryker will continue without the ability to select individual tests, thus running all test for every generated mutant.';
const IGNORE_WARNING = 'Set `testSelector` option explicitly to `null` to ignore this warning.';
const log = log4js.getLogger('TestSelectorOrchestrator');

export default class TestSelectorOrchestrator {

  constructor(private options: StrykerOptions) {
  }

  determineTestSelector(): TestSelector {
    let testSelector: TestSelector = null;
    if (this.options.testSelector) {
      testSelector = this.determineTestSelectorBasedOnTestSelectorSetting();
    } else if (this.options.testSelector === null) {
      log.debug('Running without testSelector (`testSelector: null`).');
    } else {
      if (this.options.testFramework) {
        testSelector = this.determineTestSelectorBasedOnTestFrameworkSetting();
      } else {
        log.warn(`Missing config settings \`testFramework\` or \`testSelector\`. ${WARNING_RUNNING_WITHOUT_SELECTOR} ${IGNORE_WARNING}`);
      }
    }
    return testSelector;
  }

  private determineTestSelectorBasedOnTestSelectorSetting(): TestSelector {
    if (this.testSelectorExists(this.options.testSelector)) {
      log.debug(`Using testSelector ${this.options.testSelector} based on \`testSelector\` setting`);
      return this.createTestSelector(this.options.testSelector);
    } else {
      log.warn(`Could not find test selector \`${this.options.testSelector}\`. ${WARNING_RUNNING_WITHOUT_SELECTOR} ${this.informAboutKnownTestSelectors()}`);
      return null;
    }
  }

  private determineTestSelectorBasedOnTestFrameworkSetting(): TestSelector {
    if (this.testSelectorExists(this.options.testFramework)) {
      log.debug(`Using testSelector ${this.options.testFramework} based on \`testFramework\` setting`);
      return this.createTestSelector(this.options.testFramework);
    } else {
      log.warn(`Could not find test selector \`${this.options.testFramework}\` (based on the configured testFramework). ${WARNING_RUNNING_WITHOUT_SELECTOR} ${IGNORE_WARNING} ${this.informAboutKnownTestSelectors()}`);
      return null;
    }
  }

  private informAboutKnownTestSelectors() {
    return `Did you forget to load a plugin? Known test selectors: ${JSON.stringify(TestSelectorFactory.instance().knownNames())}.`;
  }

  private createTestSelector(name: string) {
    return TestSelectorFactory.instance().create(name, this.createSettings());
  }
  private testSelectorExists(maybeSelector: string) {
    return TestSelectorFactory.instance().knownNames().indexOf(maybeSelector) > -1;
  }

  private createSettings() {
    return { options: this.options };
  }
}