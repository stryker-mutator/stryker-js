import { TestFramework } from 'stryker-api/test_framework';
import { StrykerOptions } from 'stryker-api/core';
import { tokens, commonTokens, PluginKind } from 'stryker-api/plugin';
import { Logger } from 'stryker-api/logging';
import { coreTokens } from './di';
import { PluginCreator } from './di/PluginCreator';

export default class TestFrameworkOrchestrator {

  public static inject = tokens(
    commonTokens.logger,
    commonTokens.options,
    coreTokens.pluginCreatorTestFramework);
  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly pluginCreator: PluginCreator<PluginKind.TestFramework>) { }

  public determineTestFramework(): TestFramework | null {
    if (this.options.coverageAnalysis !== 'perTest') {
      this.log.debug('The `coverageAnalysis` setting is "%s", not hooking into the test framework to achieve performance benefits.', this.options.coverageAnalysis);
      return null;
    } else {
      return this.determineFrameworkWithCoverageAnalysis();
    }
  }

  private determineFrameworkWithCoverageAnalysis(): TestFramework | null {
    let testFramework: TestFramework | null = null;
    if (this.options.testFramework) {
      try {
        testFramework = this.pluginCreator.create(this.options.testFramework);
        this.log.debug(`Using testFramework ${this.options.testFramework} based on \`testFramework\` setting`);
      } catch (error) {
        this.log.warn(`Could not create test framework \`${this.options.testFramework}\``, error);
      }
    } else {
      this.log.warn('Missing config settings `testFramework`. Set `coverageAnalysis` option explicitly to "off" to ignore this warning.');
    }
    return testFramework;
  }

}
