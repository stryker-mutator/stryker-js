import type { JSONSchema7 } from 'json-schema';
import { expect } from 'chai';
import { deepFreeze } from '@stryker-mutator/util';
import { testInjector } from '@stryker-mutator/test-helpers';

import { MetaSchemaBuilder } from '../../../src/config/index.js';
import { coreTokens } from '../../../src/di/index.js';

describe(MetaSchemaBuilder.name, () => {
  it('should merge `properties`', () => {
    const input: JSONSchema7 = deepFreeze({ properties: { foo: { type: 'string' } } });
    const additionalSchema: JSONSchema7 = deepFreeze({ properties: { bar: { type: 'string' } } });
    const additionalSchema2: JSONSchema7 = deepFreeze({ properties: { baz: { type: 'number' } } });
    const sut = testInjector.injector.provideValue(coreTokens.validationSchema, input).injectClass(MetaSchemaBuilder);
    const actual = sut.buildMetaSchema([additionalSchema, additionalSchema2] as Array<Record<string, unknown>>);
    expect(actual).deep.eq({ definitions: {}, properties: { ...input.properties, ...additionalSchema.properties, ...additionalSchema2.properties } });
  });

  it('should merge `definitions`', () => {
    const input: JSONSchema7 = deepFreeze({ definitions: { foo: { type: 'string' } } });
    const additionalSchema: JSONSchema7 = deepFreeze({ definitions: { bar: { type: 'string' } } });
    const additionalSchema2: JSONSchema7 = deepFreeze({ definitions: { baz: { type: 'number' } } });
    const sut = testInjector.injector.provideValue(coreTokens.validationSchema, input).injectClass(MetaSchemaBuilder);
    const actual = sut.buildMetaSchema([additionalSchema, additionalSchema2] as Array<Record<string, unknown>>);
    expect(actual).deep.eq({
      properties: {},
      definitions: { ...input.definitions, ...additionalSchema.definitions, ...additionalSchema2.definitions },
    });
  });
});
