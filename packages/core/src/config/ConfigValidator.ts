import { Config } from '@stryker-mutator/api/config';
import { LogLevel, MutationScoreThresholds, MutatorDescriptor, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { TestFramework } from '@stryker-mutator/api/test_framework';
import { StrykerError } from '@stryker-mutator/util';
import { coreTokens } from '../di';

export default class ConfigValidator {

  private isValid = true;
  public static inject = tokens(commonTokens.logger, commonTokens.options, coreTokens.testFramework);
  constructor(
    private readonly log: Logger,
    private readonly options: Readonly<StrykerOptions>,
    private readonly testFramework: TestFramework | null) { }

  public validate() {
    this.validateTestFramework();
    this.validateThresholds();
    this.validateMutator();
    this.validateLogLevel('logLevel');
    this.validateLogLevel('fileLogLevel');
    this.validateTimeout();
    this.validateIsNumber('maxConcurrentTestRunners', this.options.maxConcurrentTestRunners);
    this.validateIsStringArray('plugins', this.options.plugins);
    this.validateIsStringArray('reporters', this.options.reporters);
    this.validateIsStringArray('transpilers', this.options.transpilers);
    this.validateIsString('tempDirName', this.options.tempDirName);
    this.validateCoverageAnalysis();
    this.validateCoverageAnalysisWithRespectToTranspilers();
    this.crashIfNeeded();
  }

  private validateTestFramework() {
    if (this.options.coverageAnalysis === 'perTest' && !this.testFramework) {
      this.invalidate('Configured coverage analysis "perTest" requires there to be a testFramework configured. Either configure a testFramework or set coverageAnalysis to "all" or "off".');
    }
  }

  private validateMutator() {
    const mutator = this.options.mutator;
    if (typeof mutator === 'object') {
      const mutatorDescriptor = mutator as MutatorDescriptor;
      this.validateIsString('mutator.name', mutatorDescriptor.name);
      this.validateIsStringArray('mutator.excludedMutations', mutatorDescriptor.excludedMutations);
    } else if (typeof mutator !== 'string') {
      this.invalidate(`Value "${mutator}" is invalid for \`mutator\`. Expected either a string or an object`);
    }
  }

  private validateThresholds() {
    const thresholds = this.options.thresholds;
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
    if (value < 0 || value > 100 || isNaN(value)) {
      this.invalidate(`Value "${value}" is invalid for \`thresholds.${name}\`. Expected a number between 0 and 100`);
    }
  }
  
  private validateThresholdsValueExists(name: keyof MutationScoreThresholds, value: any) {
    if (typeof value !== 'number') {
      this.invalidate(`Value "${value}" is invalid for \`thresholds.${name}\`. Expected a number between 0 and 100`);
    }
  }

  private validateLogLevel(logProperty: 'logLevel' | 'fileLogLevel') {
    const logLevel = this.options[logProperty];
    const VALID_LOG_LEVEL_VALUES = [LogLevel.Fatal, LogLevel.Error, LogLevel.Warning, LogLevel.Information, LogLevel.Debug, LogLevel.Trace, LogLevel.Off];
    if (VALID_LOG_LEVEL_VALUES.indexOf(logLevel) < 0) {
      this.invalidate(`Value "${logLevel}" is invalid for \`${logProperty}\`. Expected one of the following: ${this.joinQuotedList(VALID_LOG_LEVEL_VALUES)}`);
    }
  }

  private validateTimeout() {
    this.validateIsNumber('timeoutMS', this.options.timeoutMS);
    this.validateIsNumber('timeoutFactor', this.options.timeoutFactor);
  }

  private validateCoverageAnalysis() {
    const VALID_COVERAGE_ANALYSIS_VALUES = ['perTest', 'all', 'off'];
    const coverageAnalysis = this.options.coverageAnalysis;
    if (VALID_COVERAGE_ANALYSIS_VALUES.indexOf(coverageAnalysis) < 0) {
      this.invalidate(`Value "${coverageAnalysis}" is invalid for \`coverageAnalysis\`. Expected one of the following: ${this.joinQuotedList(VALID_COVERAGE_ANALYSIS_VALUES)}`);
    }
  }

  private validateCoverageAnalysisWithRespectToTranspilers() {
    if (Array.isArray(this.options.transpilers) &&
      this.options.transpilers.length > 1 &&
      this.options.coverageAnalysis !== 'off') {
      this.invalidate(`Value "${this.options.coverageAnalysis}" for \`coverageAnalysis\` is invalid with multiple transpilers (configured transpilers: ${
        this.options.transpilers.join(', ')
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

  private joinQuotedList(arr: string[]) {
    return arr.map(v => `"${v}"`).join(', ');
  }
}
