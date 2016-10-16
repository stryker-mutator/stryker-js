import { TestFrameworkFactory, TestFramework } from 'stryker-api/test_framework';
import { StrykerOptions } from 'stryker-api/core';
import * as log4js from 'log4js';

const WARNING_RUNNING_WITHOUT_FRAMEWORK = 'Stryker will continue without hooking into the test framework, thus running all test for every generated mutant.';
const IGNORE_WARNING = 'Set `coverageAnalysis` option explicitly to "off" to ignore this warning.';
const log = log4js.getLogger('TestFrameworkOrchestrator');

export default class TestFrameworkOrchestrator {

  constructor(private options: StrykerOptions) {
  }

  determineTestFramework(): TestFramework {
    if (this.options.coverageAnalysis === 'off') {
      log.debug('The `coverageAnalysis` setting is "off", not hooking into the test framework to achieve performance benefits.');
      return null;
    } else {
      return this.determineFrameworkWithCoverageAnalysis();
    }
  }

  private determineFrameworkWithCoverageAnalysis() {
    let testFramework: TestFramework = null;
    if (this.options.testFramework) {
      testFramework = this.determineTestFrameworkBasedOnTestFrameworkSetting();
    } else {
      log.warn(`Missing config settings \`testFramework\`. ${WARNING_RUNNING_WITHOUT_FRAMEWORK} ${IGNORE_WARNING}`);
    }
    return testFramework;
  }

  private determineTestFrameworkBasedOnTestFrameworkSetting(): TestFramework {
    if (this.testFrameworkExists(this.options.testFramework)) {
      log.debug(`Using testFramework ${this.options.testFramework} based on \`testFramework\` setting`);
      return this.createTestFramework(this.options.testFramework);
    } else {
      log.warn(`Could not find test framework \`${this.options.testFramework}\`. ${WARNING_RUNNING_WITHOUT_FRAMEWORK} ${this.informAboutKnownTestFrameworks()}`);
      return null;
    }
  }

  private informAboutKnownTestFrameworks() {
    return `Did you forget to load a plugin? Known test frameworks: ${JSON.stringify(TestFrameworkFactory.instance().knownNames())}.`;
  }

  private createTestFramework(name: string) {
    return TestFrameworkFactory.instance().create(name, this.createSettings());
  }
  private testFrameworkExists(maybeFramework: string) {
    return TestFrameworkFactory.instance().knownNames().indexOf(maybeFramework) > -1;
  }

  private createSettings() {
    return { options: this.options };
  }
}