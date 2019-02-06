import { TestFramework } from 'stryker-api/test_framework';
import { MutatorDescriptor, MutationScoreThresholds, LogLevel, StrykerOptions } from 'stryker-api/core';
import { Config } from 'stryker-api/config';
import { getLogger } from 'stryker-api/logging';
import { StrykerError } from '@stryker-mutator/util';
import { normalizeWhiteSpaces } from '../utils/objectUtils';
import { tokens, commonTokens } from 'stryker-api/plugin';
import { coreTokens } from '../di';

export default class ConfigValidator {

  private isValid = true;
  private readonly log = getLogger(ConfigValidator.name);
  public static inject = tokens(commonTokens.options, coreTokens.testFramework);
  constructor(private readonly strykerConfig: Readonly<StrykerOptions>, private readonly testFramework: TestFramework | null) { }

  public validate() {
    this.validateTestFramework();
    this.validateThresholds();
    this.validateMutator();
    this.validateLogLevel('logLevel');
    this.validateLogLevel('fileLogLevel');
    this.validateTimeout();
    this.validatePort();
    this.validateIsNumber('maxConcurrentTestRunners', this.strykerConfig.maxConcurrentTestRunners);
    this.validateIsStringArray('plugins', this.strykerConfig.plugins);
    this.validateIsStringArray('reporters', this.strykerConfig.reporters);
    this.validateIsStringArray('transpilers', this.strykerConfig.transpilers);
    this.validateCoverageAnalysis();
    this.validateCoverageAnalysisWithRespectToTranspilers();
    this.crashIfNeeded();
  }

  private validateTestFramework() {
    if (this.strykerConfig.coverageAnalysis === 'perTest' && !this.testFramework) {
      this.invalidate('Configured coverage analysis "perTest" requires there to be a testFramework configured. Either configure a testFramework or set coverageAnalysis to "all" or "off".');
    }
  }

  private validateMutator() {
    const mutator = this.strykerConfig.mutator;
    if (typeof mutator === 'object') {
      const mutatorDescriptor = mutator as MutatorDescriptor;
      this.validateIsString('mutator.name', mutatorDescriptor.name);
      this.validateIsStringArray('mutator.excludedMutations', mutatorDescriptor.excludedMutations);
    } else if (typeof mutator !== 'string') {
      this.invalidate(`Value "${mutator}" is invalid for \`mutator\`. Expected either a string or an object`);
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

  public validatePort() {
    if (this.strykerConfig.port) {
      this.validateIsNumber('port', this.strykerConfig.port);
      this.deprecate('port', normalizeWhiteSpaces(
        `Test runners are expected to manage their own port selection.
      I.e. please use karma.config.port, or leave it out entirely to let the test runner itself decide.`));
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

  private validateLogLevel(logProperty: 'logLevel' | 'fileLogLevel') {
    const logLevel = this.strykerConfig[logProperty];
    const VALID_LOG_LEVEL_VALUES = [LogLevel.Fatal, LogLevel.Error, LogLevel.Warning, LogLevel.Information, LogLevel.Debug, LogLevel.Trace, LogLevel.Off];
    if (VALID_LOG_LEVEL_VALUES.indexOf(logLevel) < 0) {
      this.invalidate(`Value "${logLevel}" is invalid for \`logLevel\`. Expected one of the following: ${this.joinQuotedList(VALID_LOG_LEVEL_VALUES)}`);
    }
  }

  private validateTimeout() {
    this.validateIsNumber('timeoutMS', this.strykerConfig.timeoutMS);
    this.validateIsNumber('timeoutFactor', this.strykerConfig.timeoutFactor);
  }

  private validateCoverageAnalysis() {
    const VALID_COVERAGE_ANALYSIS_VALUES = ['perTest', 'all', 'off'];
    const coverageAnalysis = this.strykerConfig.coverageAnalysis;
    if (VALID_COVERAGE_ANALYSIS_VALUES.indexOf(coverageAnalysis) < 0) {
      this.invalidate(`Value "${coverageAnalysis}" is invalid for \`coverageAnalysis\`. Expected one of the following: ${this.joinQuotedList(VALID_COVERAGE_ANALYSIS_VALUES)}`);
    }
  }

  private validateCoverageAnalysisWithRespectToTranspilers() {
    if (Array.isArray(this.strykerConfig.transpilers) &&
      this.strykerConfig.transpilers.length > 1 &&
      this.strykerConfig.coverageAnalysis !== 'off') {
      this.invalidate(`Value "${this.strykerConfig.coverageAnalysis}" for \`coverageAnalysis\` is invalid with multiple transpilers (configured transpilers: ${
        this.strykerConfig.transpilers.join(', ')
        }). Please report this to the Stryker team if you whish this feature to be implemented`);
    }
  }

  private crashIfNeeded() {
    if (!this.isValid) {
      throw new StrykerError('Stryker could not recover from this configuration error, see fatal log message(s) above.');
    }
  }

  private validateIsNumber(fieldName: keyof Config, value: any) {
    if (typeof value !== 'number' || isNaN(value)) {
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

  private deprecate(deprecatedOption: keyof StrykerOptions, message: string) {
    this.log.warn(`Stryker option "${deprecatedOption}" is deprecated. ${message}`);
  }

  private joinQuotedList(arr: string[]) {
    return arr.map(v => `"${v}"`).join(', ');
  }
}
