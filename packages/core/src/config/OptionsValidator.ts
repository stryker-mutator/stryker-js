import os = require('os');

import Ajv = require('ajv');
import { StrykerOptions, strykerCoreSchema, WarningOptions } from '@stryker-mutator/api/core';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { noopLogger, normalizeWhitespaces, propertyPath } from '@stryker-mutator/util';
import { Logger } from '@stryker-mutator/api/logging';

import { coreTokens } from '../di';
import { ConfigError } from '../errors';
import { isWarningEnabled } from '../utils/objectUtils';

import { describeErrors } from './validationErrors';

const ajv = new Ajv({ useDefaults: true, allErrors: true, jsonPointers: false, verbose: true, missingRefs: 'ignore', logger: false });

export class OptionsValidator {
  private readonly validateFn: Ajv.ValidateFunction;

  public static readonly inject = tokens(coreTokens.validationSchema, commonTokens.logger);

  constructor(schema: Record<string, unknown>, private readonly log: Logger) {
    this.validateFn = ajv.compile(schema);
  }

  public validate(options: unknown): asserts options is StrykerOptions {
    this.schemaValidate(options);
    this.additionalValidation(options);
  }

  private additionalValidation(options: StrykerOptions) {
    const additionalErrors: string[] = [];
    if (options.thresholds.high < options.thresholds.low) {
      additionalErrors.push('Config option "thresholds.high" should be higher than "thresholds.low".');
    }
    if (options.transpilers.length > 1 && options.coverageAnalysis !== 'off') {
      additionalErrors.push(
        normalizeWhitespaces(
          `Config option "coverageAnalysis" is invalid. Coverage analysis "${options.coverageAnalysis}" 
          is not supported for multiple transpilers (configured transpilers: ${options.transpilers.map((t) => `"${t}"`).join(', ')}).
          Change it to "off". Please report this to the Stryker team if you whish this feature to be implemented.`
        )
      );
    }
    if (options.maxConcurrentTestRunners !== Number.MAX_SAFE_INTEGER) {
      this.log.warn('DEPRECATED. Use of "maxConcurrentTestRunners" is deprecated. Please use "concurrency" instead.');
      if (!options.concurrency && options.maxConcurrentTestRunners < os.cpus().length - 1) {
        options.concurrency = options.maxConcurrentTestRunners;
      }
    }

    additionalErrors.forEach((error) => this.log.error(error));
    this.throwErrorIfNeeded(additionalErrors);
  }

  private schemaValidate(options: unknown): asserts options is StrykerOptions {
    if (!this.validateFn(options)) {
      const errors = describeErrors(this.validateFn.errors!);
      errors.forEach((error) => this.log.error(error));
      this.throwErrorIfNeeded(errors);
    }
  }

  private throwErrorIfNeeded(errors: string[]) {
    if (errors.length > 0) {
      throw new ConfigError(
        errors.length === 1 ? 'Please correct this configuration error and try again.' : 'Please correct these configuration errors and try again.'
      );
    }
  }
}

export function defaultOptions(): StrykerOptions {
  const options: unknown = {};
  const validator: OptionsValidator = new OptionsValidator(strykerCoreSchema, noopLogger);
  validator.validate(options);
  return options;
}

validateOptions.inject = tokens(commonTokens.options, coreTokens.optionsValidator);
export function validateOptions(options: unknown, optionsValidator: OptionsValidator): StrykerOptions {
  optionsValidator.validate(options);
  return options;
}

markUnknownOptions.inject = tokens(commonTokens.options, coreTokens.validationSchema, commonTokens.logger);
export function markUnknownOptions(options: StrykerOptions, schema: Record<string, unknown>, log: Logger): StrykerOptions {
  const OPTIONS_ADDED_BY_STRYKER = ['set', 'configFile', '$schema'];
  if (isWarningEnabled('unknownOptions', options.warnings)) {
    const unknownPropertyNames = Object.keys(options)
      .filter((key) => !key.endsWith('_comment'))
      .filter((key) => !OPTIONS_ADDED_BY_STRYKER.includes(key))
      .filter((key) => !Object.keys((schema as any).properties).includes(key));
    unknownPropertyNames.forEach((unknownPropertyName) => {
      log.warn(`Unknown stryker config option "${unknownPropertyName}".`);
    });
    const p = `${propertyPath<StrykerOptions>('warnings')}.${propertyPath<WarningOptions>('unknownOptions')}`;
    if (unknownPropertyNames.length) {
      log.warn(`
   Possible causes:
   * Is it a typo on your end?
   * Did you only write this property as a comment? If so, please postfix it with "_comment".
   * You might be missing a plugin that is supposed to use it. Stryker loaded plugins from: ${JSON.stringify(options.plugins)}
   * The plugin that is using it did not contribute explicit validation. 
   (disable "${p}" to ignore this warning)`);
    }
  }
  return options;
}
