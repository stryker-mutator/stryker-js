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
    this.validateLogLevel();
    this.validateTimeout();
    this.validateIsNumber('port', this.strykerConfig.port);
    this.validateIsNumber('maxConcurrentTestRunners', this.strykerConfig.maxConcurrentTestRunners);
    this.validateIsString('mutator', this.strykerConfig.mutator);
    this.validateIsStringArray('plugins', this.strykerConfig.plugins);
    this.validateIsStringArray('reporter', this.strykerConfig.reporter);
    this.validateIsStringArray('transpilers', this.strykerConfig.transpilers);
    this.validateCoverageAnalysis();
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
      this.invalidate(`Value "${value}" is invalid for \`thresholds.${name}\`. Expected a number between 0 and 100`);
    }
  }

  private validateThresholdsValueExists(name: keyof MutationScoreThresholds, value: number | undefined) {
    if (typeof value !== 'number') {
      this.invalidate(`Value "${value}" is invalid for \`thresholds.${name}\`. Expected a number between 0 and 100`);
    }
  }

  private validateLogLevel() {
    const logLevel = this.strykerConfig.logLevel;
    const VALID_LOG_LEVEL_VALUES = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'all', 'off'];
    if (VALID_LOG_LEVEL_VALUES.indexOf(logLevel) < 0) {
      this.invalidate(`Value "${logLevel}" is invalid for \`logLevel\`. Expected one of the following: ${this.joinQuotedList(VALID_LOG_LEVEL_VALUES)}`);
    }
  }

  private validateTimeout() {
    this.validateIsNumber('timeoutMs', this.strykerConfig.timeoutMs);
    this.validateIsNumber('timeoutFactor', this.strykerConfig.timeoutFactor);
  }

  private validateCoverageAnalysis() {
    const VALID_COVERAGE_ANALYSIS_VALUES = ['perTest', 'all', 'off'];
    const coverageAnalysis = this.strykerConfig.coverageAnalysis;
    if (VALID_COVERAGE_ANALYSIS_VALUES.indexOf(coverageAnalysis) < 0) {
      this.invalidate(`Value "${coverageAnalysis}" is invalid for \`coverageAnalysis\`. Expected one of the following: ${this.joinQuotedList(VALID_COVERAGE_ANALYSIS_VALUES)}`);
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

  private validateIsNumber(fieldName: keyof Config, value: any) {
    if (typeof value !== 'number') {
      this.invalidate(`Value "${value}" is invalid for \`${fieldName}\`. Expected a number`);
    }
  }

  private validateIsString(fieldName: keyof Config, value: any) {
    if (typeof value !== 'string') {
      this.invalidate(`Value "${value}" is invalid for \`${fieldName}\`. Expected a string`);
    }
  }

  private validateIsStringArray(fieldName: keyof Config, value: any) {
    if (!Array.isArray(value)) {
      this.invalidate(`Value "${value}" is invalid for \`${fieldName}\`. Expected an array`);
    } else {
      value.forEach(v => {
        if (typeof v !== 'string') {
          this.invalidate(`Value "${v}" is an invalid element of \`${fieldName}\`. Expected a string`);
        }
      });
    }
  }

  private invalidate(message: string) {
    this.log.fatal(message);
    this.isValid = false;
  }

  private joinQuotedList(arr: string[]) {
    return arr.map(v => `"${v}"`).join(', ');
  }
}
