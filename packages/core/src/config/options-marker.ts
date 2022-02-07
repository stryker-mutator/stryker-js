import type { JSONSchema7 } from 'json-schema';
import { tokens } from 'typed-inject';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';
import { PropertyPathBuilder, findUnserializables } from '@stryker-mutator/util';

import { coreTokens } from '../di/index.js';
import { objectUtils } from '../utils/object-utils.js';

markOptions.inject = tokens(commonTokens.options, coreTokens.validationSchema, commonTokens.logger);

/**
 * Performs additional validation on the Stryker options to mark unusual behavior with a warning.
 * Namely when a value isn't serializable or when unknown options are passed in.
 */
export function markOptions(options: StrykerOptions, schema: JSONSchema7, log: Logger): StrykerOptions {
  markUnknownOptions(options, schema, log);
  markUnserializableOptions(options, log);
  return options;
}

function markUnknownOptions(options: StrykerOptions, schema: JSONSchema7, log: Logger) {
  const OPTIONS_ADDED_BY_STRYKER = ['set', 'configFile', '$schema'];

  if (objectUtils.isWarningEnabled('unknownOptions', options.warnings)) {
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
}

function markUnserializableOptions(options: StrykerOptions, log: Logger) {
  if (objectUtils.isWarningEnabled('unserializableOptions', options.warnings)) {
    const unserializables = findUnserializables(options);
    if (unserializables) {
      unserializables.forEach(({ reason, path }) =>
        log.warn(
          `Config option "${path.join(
            '.'
          )}" is not (fully) serializable. ${reason}. Any test runner or checker worker processes might not receive this value as intended.`
        )
      );
      const p = PropertyPathBuilder.create<StrykerOptions>().prop('warnings').prop('unserializableOptions').build();
      log.warn(`(disable ${p} to ignore this warning)`);
    }
  }
}
