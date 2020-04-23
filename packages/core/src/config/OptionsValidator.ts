import Ajv = require('ajv');
import { StrykerOptions, strykerCoreSchema } from '@stryker-mutator/api/core';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { noopLogger, normalizeWhitespaces } from '@stryker-mutator/util';
import { Logger } from '@stryker-mutator/api/logging';

import { coreTokens } from '../di';
import { ConfigError } from '../errors';

import { describeErrors } from './validationErrors';

const ajv = new Ajv({ useDefaults: true, allErrors: true, jsonPointers: false, verbose: true, missingRefs: 'ignore', logger: false });

export class OptionsValidator {
  private readonly validateFn: Ajv.ValidateFunction;

  public static readonly inject = tokens(coreTokens.validationSchema, commonTokens.logger);

  constructor(schema: object, private readonly log: Logger) {
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

export function validateOptions(options: unknown, optionsValidator: OptionsValidator): StrykerOptions {
  optionsValidator.validate(options);
  return options;
}
validateOptions.inject = tokens(commonTokens.options, coreTokens.optionsValidator);
