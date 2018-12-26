import { StrykerOptions } from 'stryker-api/core';
import { getLogger } from 'stryker-api/logging';
import { TestFramework, TestFrameworkFactory } from 'stryker-api/test_framework';

export default class TestFrameworkOrchestrator {
  private readonly log = getLogger(TestFrameworkOrchestrator.name);

  constructor(private readonly options: StrykerOptions) { }

  public determineTestFramework(): TestFramework | null {
    if (this.options.coverageAnalysis !== 'perTest') {
      this.log.debug('The `coverageAnalysis` setting is "%s", not hooking into the test framework to achieve performance benefits.', this.options.coverageAnalysis);

      return null;
    } else {
      return this.determineFrameworkWithCoverageAnalysis();
    }
  }

  private createTestFramework(name: string) {
    return TestFrameworkFactory.instance().create(name, { options: this.options });
  }

  private determineFrameworkWithCoverageAnalysis(): TestFramework | null {
    let testFramework: TestFramework | null = null;
    if (this.options.testFramework) {
      if (this.testFrameworkExists(this.options.testFramework)) {
        this.log.debug(`Using testFramework ${this.options.testFramework} based on \`testFramework\` setting`);
        testFramework = this.createTestFramework(this.options.testFramework);
      } else {
        this.log.warn(`Could not find test framework \`${this.options.testFramework}\`. ${this.informAboutKnownTestFrameworks()}`);
      }
    } else {
      this.log.warn('Missing config settings `testFramework`. Set `coverageAnalysis` option explicitly to "off" to ignore this warning.');
    }

    return testFramework;
  }

  private informAboutKnownTestFrameworks() {
    return `Did you forget to load a plugin? Known test frameworks: ${JSON.stringify(TestFrameworkFactory.instance().knownNames())}.`;
  }
  private testFrameworkExists(maybeFramework: string) {
    return TestFrameworkFactory.instance().knownNames().indexOf(maybeFramework) > -1;
  }

}
