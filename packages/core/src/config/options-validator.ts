import os from 'os';

import { hasMagic } from 'glob';

import Ajv, { ValidateFunction } from 'ajv';
import { StrykerOptions, strykerCoreSchema } from '@stryker-mutator/api/core';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { noopLogger, propertyPath, deepFreeze, PropertyPathBuilder } from '@stryker-mutator/util';
import { Logger } from '@stryker-mutator/api/logging';
import type { JSONSchema7 } from 'json-schema';

import { coreTokens } from '../di';
import { ConfigError } from '../errors';
import { isWarningEnabled } from '../utils/object-utils';
import { CommandTestRunner } from '../test-runner/command-test-runner';
import { MUTATION_RANGE_REGEX } from '../input';

import { describeErrors } from './validation-errors';

const ajv = new Ajv({ useDefaults: true, allErrors: true, jsPropertySyntax: true, verbose: true, logger: false, strict: false });

export class OptionsValidator {
  private readonly validateFn: ValidateFunction;

  public static readonly inject = tokens(coreTokens.validationSchema, commonTokens.logger);

  constructor(schema: JSONSchema7, private readonly log: Logger) {
    this.validateFn = ajv.compile(schema);
  }

  public validate(options: Record<string, unknown>): asserts options is StrykerOptions {
    this.removeDeprecatedOptions(options);
    this.schemaValidate(options);
    this.additionalValidation(options);
  }

  private removeDeprecatedOptions(rawOptions: Record<string, unknown>) {
    if (typeof rawOptions.mutator === 'string') {
      this.log.warn(
        'DEPRECATED. Use of "mutator" as string is no longer needed. You can remove it from your configuration. Stryker now supports mutating of JavaScript and friend files out of the box.'
      );
      delete rawOptions.mutator;
    }
    // @ts-expect-error mutator.name
    if (typeof rawOptions.mutator === 'object' && rawOptions.mutator.name) {
      this.log.warn(
        'DEPRECATED. Use of "mutator.name" is no longer needed. You can remove "mutator.name" from your configuration. Stryker now supports mutating of JavaScript and friend files out of the box.'
      );
      // @ts-expect-error mutator.name
      delete rawOptions.mutator.name;
    }
    if (Object.keys(rawOptions).includes('testFramework')) {
      this.log.warn(
        'DEPRECATED. Use of "testFramework" is no longer needed. You can remove it from your configuration. Your test runner plugin now handles its own test framework integration.'
      );
      delete rawOptions.testFramework;
    }
    if (Array.isArray(rawOptions.transpilers)) {
      const example = rawOptions.transpilers.includes('babel')
        ? 'babel src --out-dir lib'
        : rawOptions.transpilers.includes('typescript')
        ? 'tsc -b'
        : rawOptions.transpilers.includes('webpack')
        ? 'webpack --config webpack.config.js'
        : 'npm run build';
      this.log.warn(
        `DEPRECATED. Support for "transpilers" is removed. You can now configure your own "${propertyPath<StrykerOptions>(
          'buildCommand'
        )}". For example, ${example}.`
      );
      delete rawOptions.transpilers;
    }
  }

  private additionalValidation(options: StrykerOptions) {
    const additionalErrors: string[] = [];
    if (options.thresholds.high < options.thresholds.low) {
      additionalErrors.push('Config option "thresholds.high" should be higher than "thresholds.low".');
    }
    if (options.maxConcurrentTestRunners !== Number.MAX_SAFE_INTEGER) {
      this.log.warn('DEPRECATED. Use of "maxConcurrentTestRunners" is deprecated. Please use "concurrency" instead.');
      if (!options.concurrency && options.maxConcurrentTestRunners < os.cpus().length - 1) {
        options.concurrency = options.maxConcurrentTestRunners;
      }
    }
    if (CommandTestRunner.is(options.testRunner) && options.testRunnerNodeArgs.length) {
      this.log.warn(
        'Using "testRunnerNodeArgs" together with the "command" test runner is not supported, these arguments will be ignored. You can add your custom arguments by setting the "commandRunner.command" option.'
      );
    }
    options.mutate.forEach((mutateString, index) => {
      const match = MUTATION_RANGE_REGEX.exec(mutateString);
      if (match) {
        if (hasMagic(mutateString)) {
          additionalErrors.push(
            `Config option "mutate[${index}]" is invalid. Cannot combine a glob expression with a mutation range in "${mutateString}".`
          );
        } else {
          const [_, _fileName, mutationRange, startLine, _startColumn, endLine, _endColumn] = match;
          const start = parseInt(startLine, 10);
          const end = parseInt(endLine, 10);
          if (start < 1) {
            additionalErrors.push(
              `Config option "mutate[${index}]" is invalid. Mutation range "${mutationRange}" is invalid, line ${start} does not exist (lines start at 1).`
            );
          }
          if (start > end) {
            additionalErrors.push(
              `Config option "mutate[${index}]" is invalid. Mutation range "${mutationRange}" is invalid. The "from" line number (${start}) should be less then the "to" line number (${end}).`
            );
          }
        }
      }
    });

    additionalErrors.forEach((error) => this.log.error(error));
    this.throwErrorIfNeeded(additionalErrors);
  }

  private schemaValidate(options: unknown): asserts options is StrykerOptions {
    if (!this.validateFn(options)) {
      const describedErrors = describeErrors(this.validateFn.errors!);
      describedErrors.forEach((error) => this.log.error(error));
      this.throwErrorIfNeeded(describedErrors);
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
  const options: Record<string, unknown> = {};
  const validator: OptionsValidator = new OptionsValidator(strykerCoreSchema, noopLogger);
  validator.validate(options);
  return options;
}

validateOptions.inject = tokens(commonTokens.options, coreTokens.optionsValidator);
export function validateOptions(options: Record<string, unknown>, optionsValidator: OptionsValidator): StrykerOptions {
  optionsValidator.validate(options);
  return deepFreeze(options) as StrykerOptions;
}

markUnknownOptions.inject = tokens(commonTokens.options, coreTokens.validationSchema, commonTokens.logger);
export function markUnknownOptions(options: StrykerOptions, schema: JSONSchema7, log: Logger): StrykerOptions {
  const OPTIONS_ADDED_BY_STRYKER = ['set', 'configFile', '$schema'];

  if (isWarningEnabled('unknownOptions', options.warnings)) {
    const schemaKeys = Object.keys(schema.properties!);
    const unknownPropertyNames = Object.keys(options)
      .filter((key) => !key.endsWith('_comment'))
      .filter((key) => !OPTIONS_ADDED_BY_STRYKER.includes(key))
      .filter((key) => !schemaKeys.includes(key));

    if (unknownPropertyNames.length) {
      unknownPropertyNames.forEach((unknownPropertyName) => {
        log.warn(`Unknown stryker config option "${unknownPropertyName}".`);
      });

      const p = PropertyPathBuilder.create<StrykerOptions>().prop('warnings').prop('unknownOptions').build();

      log.warn(`Possible causes:
   * Is it a typo on your end?
   * Did you only write this property as a comment? If so, please postfix it with "_comment".
   * You might be missing a plugin that is supposed to use it. Stryker loaded plugins from: ${JSON.stringify(options.plugins)}
   * The plugin that is using it did not contribute explicit validation. 
   (disable "${p}" to ignore this warning)`);
    }
  }

  return options;
}
