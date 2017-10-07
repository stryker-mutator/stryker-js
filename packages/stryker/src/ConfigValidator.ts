import { TestFramework } from 'stryker-api/test_framework';
import { MutationScoreThresholds } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import { getLogger } from 'log4js';

export default class ConfigValidator {

  private isValid = true;
  private readonly log = getLogger(ConfigValidator.name);

  constructor(private strykerConfig: Config, private testFramework: TestFramework | null) {
  }

  validate() {
    this.validateTestFramework();
    this.validateThresholds();
    this.downgradeCoverageAnalysisIfNeeded();
    this.crashIfNeeded();
  }

  private validateTestFramework() {
    if (this.strykerConfig.coverageAnalysis === 'perTest' && !this.testFramework) {
      this.invalidate('Configured coverage analysis "perTest" requires there to be a testFramework configured. Either configure a testFramework or set coverageAnalysis to "all" or "off".');
    }
  }

  private validateThresholds() {
    const thresholds = this.strykerConfig.thresholds;
    this.validateThresholdsValueExists('high', thresholds.high);
    this.validateThresholdsValueExists('low', thresholds.low);
    this.validateThresholdValue('high', thresholds.high);
    this.validateThresholdValue('low', thresholds.low);
    this.validateThresholdValue('break', thresholds.break);
    if (thresholds.high < thresholds.low) {
      this.invalidate(`\`thresholds.high\` is lower than \`thresholds.low\` (${thresholds.high} < ${thresholds.low})`);
    }
  }

  private validateThresholdValue(name: keyof MutationScoreThresholds, value: number | null) {
    if (typeof value === 'number' && (value < 0 || value > 100)) {
      this.invalidate(`thresholds.${name} should be between 0 and 100 (was ${value})`);
    }
  }

  private validateThresholdsValueExists(name: keyof MutationScoreThresholds, value: number | undefined) {
    if (typeof value !== 'number') {
      this.invalidate(`thresholds.${name} is invalid, expected a number between 0 and 100 (was ${value}).`);
    }
  }

  private downgradeCoverageAnalysisIfNeeded() {
    if (this.strykerConfig.transpilers.length && this.strykerConfig.coverageAnalysis !== 'off') {
      this.log.info('Disabled coverage analysis for this run (off). Coverage analysis using transpilers is not supported yet.');
      this.strykerConfig.coverageAnalysis = 'off';
    }
  }

  private crashIfNeeded() {
    if (!this.isValid) {
      process.exit(1);
    }
  }

  private invalidate(message: string) {
    this.log.fatal(message);
    this.isValid = false;
  }
}
