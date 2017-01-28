import { TestFrameworkFactory, TestFramework } from 'stryker-api/test_framework';
import { StrykerOptions } from 'stryker-api/core';
import * as log4js from 'log4js';

const log = log4js.getLogger('TestFrameworkOrchestrator');

export default class TestFrameworkOrchestrator {

  constructor(private options: StrykerOptions) {
  }

  determineTestFramework(): TestFramework | void {
    if (this.options.coverageAnalysis !== 'perTest') {
      log.debug('The `coverageAnalysis` setting is "%s", not hooking into the test framework to achieve performance benefits.', this.options.coverageAnalysis);
    } else {
      return this.determineFrameworkWithCoverageAnalysis();
    }
  }

  private determineFrameworkWithCoverageAnalysis(): TestFramework {
    let testFramework: TestFramework;
    if (this.options.testFramework) {
      if (this.testFrameworkExists(this.options.testFramework)) {
        log.debug(`Using testFramework ${this.options.testFramework} based on \`testFramework\` setting`);
        testFramework = this.createTestFramework(this.options.testFramework);
      } else {
        log.warn(`Could not find test framework \`${this.options.testFramework}\`. ${this.informAboutKnownTestFrameworks()}`);
      }
    } else {
      log.warn('Missing config settings `testFramework`. Set `coverageAnalysis` option explicitly to "off" to ignore this warning.');
    }
    return testFramework;
  }

  private informAboutKnownTestFrameworks() {
    return `Did you forget to load a plugin? Known test frameworks: ${JSON.stringify(TestFrameworkFactory.instance().knownNames())}.`;
  }

  private createTestFramework(name: string) {
    return TestFrameworkFactory.instance().create(name, { options: this.options });
  }
  private testFrameworkExists(maybeFramework: string) {
    return TestFrameworkFactory.instance().knownNames().indexOf(maybeFramework) > -1;
  }

}