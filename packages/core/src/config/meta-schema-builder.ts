import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import type { JSONSchema7 } from 'json-schema';
import { Logger } from '@stryker-mutator/api/logging';

import { coreTokens } from '../di/index.js';

export class MetaSchemaBuilder {
  public static inject = tokens(
    coreTokens.validationSchema,
    commonTokens.logger,
  );
  constructor(
    private readonly schema: JSONSchema7,
    private readonly log: Logger,
  ) {}

  public buildMetaSchema(
    pluginSchemaContributions: Array<Record<string, unknown>>,
  ): JSONSchema7 {
    this.log.debug(
      'Contributing %s schemas from plugins to options validation.',
      pluginSchemaContributions.length,
    );
    return mergedSchema(this.schema, pluginSchemaContributions);
  }
}
function mergedSchema(
  mainSchema: JSONSchema7,
  additionalSchemas: JSONSchema7[],
): JSONSchema7 {
  const schema = {
    ...mainSchema,
    properties: {
      ...mainSchema.properties,
    },
    definitions: {
      ...mainSchema.definitions,
    },
  };

  Object.assign(
    schema.properties,
    ...additionalSchemas.map((s) => s.properties),
  );
  Object.assign(
    schema.definitions,
    ...additionalSchemas.map((s) => s.definitions),
  );
  return schema;
}
