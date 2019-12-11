import { Config } from '@stryker-mutator/api/config';
import { LogLevel, MutationScoreThresholds, StrykerOptions, ALL_REPORT_TYPES } from '@stryker-mutator/api/core';
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
    private readonly testFramework: TestFramework | null
  ) {}

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
    this.validateIsOptionalDeepString('dashboard', 'project');
    this.validateIsOptionalDeepString('dashboard', 'module');
    this.validateIsOptionalDeepString('dashboard', 'version');
    this.validateDeepEnum('dashboard', 'reportType', ALL_REPORT_TYPES);
    this.validateIsDeepString('dashboard', 'baseUrl');
    this.validateCoverageAnalysis();
    this.validateCoverageAnalysisWithRespectToTranspilers();
    this.crashIfNeeded();
  }

  private validateTestFramework() {
    if (this.options.coverageAnalysis === 'perTest' && !this.testFramework) {
      this.invalidate(
        'Configured coverage analysis "perTest" requires there to be a testFramework configured. Either configure a testFramework or set coverageAnalysis to "all" or "off".'
      );
    }
  }

  private validateMutator() {
    const mutator = this.options.mutator;
    if (typeof mutator === 'object') {
      const mutatorDescriptor = mutator;
      this.validateIsString('mutator.name', mutatorDescriptor.name);
      this.validateIsOptionalStringArray('mutator.excludedMutations', mutatorDescriptor.excludedMutations);
      this.validateIsOptionalArray('mutator.plugins', mutatorDescriptor.plugins);
    } else if (typeof mutator !== 'string') {
      this.invalidate(`Value ${stringify(mutator)} is invalid for \`mutator\`. Expected either a string or an object`);
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
    if (typeof value === 'number' && (value < 0 || value > 100 || isNaN(value))) {
      this.invalidate(`Value ${stringify(value)} is invalid for \`thresholds.${name}\`. Expected a number between 0 and 100`);
    }
  }

  private validateThresholdsValueExists(name: keyof MutationScoreThresholds, value: any) {
    if (typeof value !== 'number') {
      this.invalidate(`Value ${stringify(value)} is invalid for \`thresholds.${name}\`. Expected a number between 0 and 100`);
    }
  }

  private validateLogLevel(logProperty: 'logLevel' | 'fileLogLevel') {
    const logLevel = this.options[logProperty];
    const VALID_LOG_LEVEL_VALUES = [
      LogLevel.Fatal,
      LogLevel.Error,
      LogLevel.Warning,
      LogLevel.Information,
      LogLevel.Debug,
      LogLevel.Trace,
      LogLevel.Off
    ];
    if (!VALID_LOG_LEVEL_VALUES.includes(logLevel)) {
      this.invalidate(
        `Value "${logLevel}" is invalid for \`${logProperty}\`. Expected one of the following: ${this.joinQuotedList(VALID_LOG_LEVEL_VALUES)}`
      );
    }
  }

  private validateTimeout() {
    this.validateIsNumber('timeoutMS', this.options.timeoutMS);
    this.validateIsNumber('timeoutFactor', this.options.timeoutFactor);
  }

  private validateCoverageAnalysis() {
    const VALID_COVERAGE_ANALYSIS_VALUES = ['perTest', 'all', 'off'];
    const coverageAnalysis = this.options.coverageAnalysis;
    if (!VALID_COVERAGE_ANALYSIS_VALUES.includes(coverageAnalysis)) {
      this.invalidate(
        `Value ${stringify(coverageAnalysis)} is invalid for \`coverageAnalysis\`. Expected one of the following: ${this.joinQuotedList(
          VALID_COVERAGE_ANALYSIS_VALUES
        )}`
      );
    }
  }

  private validateCoverageAnalysisWithRespectToTranspilers() {
    if (Array.isArray(this.options.transpilers) && this.options.transpilers.length > 1 && this.options.coverageAnalysis !== 'off') {
      this.invalidate(
        `Value "${
          this.options.coverageAnalysis
        }" for \`coverageAnalysis\` is invalid with multiple transpilers (configured transpilers: ${this.options.transpilers.join(
          ', '
        )}). Please report this to the Stryker team if you whish this feature to be implemented`
      );
    }
  }

  private crashIfNeeded() {
    if (!this.isValid) {
      throw new StrykerError('Stryker could not recover from this configuration error, see fatal log message(s) above.');
    }
  }

  private validateIsNumber(fieldName: keyof Config, value: any) {
    if (typeof value !== 'number' || isNaN(value)) {
      this.invalidate(`Value ${stringify(value)} is invalid for \`${fieldName}\`. Expected a number`);
    }
  }

  private validateIsString(fieldName: keyof Config, value: any) {
    if (typeof value !== 'string') {
      this.invalidate(`Value ${stringify(value)} is invalid for \`${fieldName}\`. Expected a string`);
    }
  }

  private validateIsDeepString<T extends keyof Config, T2 extends keyof Config[T]>(fieldName: T, secondFieldName: T2) {
    const value = this.options[fieldName][secondFieldName];
    if (typeof value !== 'string') {
      this.invalidate(`Value ${stringify(value)} is invalid for \`${fieldName}.${secondFieldName}\`. Expected a string`);
    }
  }

  private validateDeepEnum<T extends keyof Config, T2 extends keyof Config[T]>(
    fieldName: T,
    secondFieldName: T2,
    validValues: Config[T][T2] extends infer TValue ? readonly TValue[] : never
  ) {
    const value = this.options[fieldName][secondFieldName];
    if (!validValues.includes(value)) {
      this.invalidate(
        `Value ${stringify(value)} is invalid for \`${fieldName}.${secondFieldName}\`. Expected one of the following: ${validValues
          .map(stringify)
          .join(', ')}`
      );
    }
  }

  private validateIsOptionalDeepString<T extends keyof Config, T2 extends keyof Config[T]>(fieldName: T, secondFieldName: T2) {
    const value = this.options[fieldName][secondFieldName];
    if (typeof value !== 'string' && value !== undefined) {
      // Let my sibling handle the error formatting
      this.validateIsDeepString(fieldName, secondFieldName);
    }
  }

  private validateIsStringArray(fieldName: keyof Config, value: any) {
    if (!Array.isArray(value)) {
      this.invalidate(`Value ${stringify(value)} is invalid for \`${fieldName}\`. Expected an array`);
    } else {
      value.forEach(v => {
        if (typeof v !== 'string') {
          this.invalidate(`Value ${stringify(v)} is an invalid element of \`${fieldName}\`. Expected a string`);
        }
      });
    }
  }

  private validateIsArray(fieldName: keyof Config, value: unknown[]) {
    if (!Array.isArray(value)) {
      this.invalidate(`Value "${value}" is invalid for \`${fieldName}\`. Expected an array`);
    }
  }

  private validateIsOptionalStringArray(fieldName: keyof Config, value: string[] | undefined) {
    value === undefined || this.validateIsStringArray(fieldName, value);
  }

  private validateIsOptionalArray(fieldName: keyof Config, value: unknown[] | undefined | null) {
    value === undefined || value === null || this.validateIsArray(fieldName, value);
  }

  private invalidate(message: string) {
    this.log.fatal(message);
    this.isValid = false;
  }

  private joinQuotedList(arr: string[]) {
    return arr.map(v => `"${v}"`).join(', ');
  }
}

function stringify(value: unknown): string {
  if (typeof value === 'number' && isNaN(value)) {
    return 'NaN';
  } else {
    return JSON.stringify(value);
  }
}
