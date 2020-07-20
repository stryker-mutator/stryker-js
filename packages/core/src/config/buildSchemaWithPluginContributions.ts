import { commonTokens, PluginResolver, tokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';

import { coreTokens } from '../di';

function mergedSchema(mainSchema: Record<string, any>, additionalSchemas: Array<Record<string, any>>): Record<string, unknown> {
  const schema = {
    ...mainSchema,
    properties: {
      ...mainSchema.properties,
    },
    definitions: {
      ...mainSchema.definitions,
    },
  };

  Object.assign(schema.properties, ...additionalSchemas.map((s) => s.properties));
  Object.assign(schema.definitions, ...additionalSchemas.map((s) => s.definitions));
  return schema;
}

export function buildSchemaWithPluginContributions(
  schema: Record<string, any>,
  pluginResolver: PluginResolver,
  logger: Logger
): Record<string, unknown> {
  const additionalSchemas = pluginResolver.resolveValidationSchemaContributions();
  logger.debug('Contributing %s schemas from plugins to options validation.', additionalSchemas.length);
  return mergedSchema(schema, additionalSchemas);
}
buildSchemaWithPluginContributions.inject = tokens(coreTokens.validationSchema, commonTokens.pluginResolver, commonTokens.logger);
