import type { JSONSchema7 } from 'json-schema';
import { expect } from 'chai';
import { deepFreeze } from '@stryker-mutator/util';
import { factory, testInjector } from '@stryker-mutator/test-helpers';
import { PluginResolver } from '@stryker-mutator/api/plugin';

import { buildSchemaWithPluginContributions } from '../../../src/config';

describe(buildSchemaWithPluginContributions.name, () => {
  let pluginResolverStub: sinon.SinonStubbedInstance<PluginResolver>;
  let pluginContributions: object[];

  beforeEach(() => {
    pluginResolverStub = factory.pluginResolver();
    pluginContributions = [];
    pluginResolverStub.resolveValidationSchemaContributions.returns(pluginContributions);
  });

  it('should merge `properties`', () => {
    const input: JSONSchema7 = deepFreeze({ properties: { foo: { type: 'string' } } });
    const additionalSchema: JSONSchema7 = deepFreeze({ properties: { bar: { type: 'string' } } });
    const additionalSchema2: JSONSchema7 = deepFreeze({ properties: { baz: { type: 'number' } } });
    pluginContributions.push(additionalSchema, additionalSchema2);
    const actual = buildSchemaWithPluginContributions(input, pluginResolverStub, testInjector.logger);
    expect(actual).deep.eq({ definitions: {}, properties: { ...input.properties, ...additionalSchema.properties, ...additionalSchema2.properties } });
  });

  it('should merge `definitions`', () => {
    const input: JSONSchema7 = deepFreeze({ definitions: { foo: { type: 'string' } } });
    const additionalSchema: JSONSchema7 = deepFreeze({ definitions: { bar: { type: 'string' } } });
    const additionalSchema2: JSONSchema7 = deepFreeze({ definitions: { baz: { type: 'number' } } });
    pluginContributions.push(additionalSchema, additionalSchema2);
    const actual = buildSchemaWithPluginContributions(input, pluginResolverStub, testInjector.logger);
    expect(actual).deep.eq({
      properties: {},
      definitions: { ...input.definitions, ...additionalSchema.definitions, ...additionalSchema2.definitions }
    });
  });
});
