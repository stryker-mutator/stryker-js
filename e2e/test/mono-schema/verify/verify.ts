import { expect } from 'chai';
import valid from '../test/valid.json';
import invalid from '../test/invalid.json';
import monoSchema from '@stryker-mutator/core/schema/stryker-schema.json';
import Ajv from 'ajv';
import Axios from 'axios';
import { beforeEach } from 'mocha';

const ajv = new Ajv({
  async: true,
  allErrors: true,
  loadSchema: async (url) => {
    const content = await Axios.get(url);
    delete content.data.$schema;
    return content.data;
  },
});

describe('The Stryker meta schema', () => {
  let validator: Ajv.ValidateFunction;

  beforeEach(async () => {
    validator = await ajv.compileAsync(monoSchema);
  });

  it('should validate a valid schema', async () => {
    expect(validator(valid), ajv.errorsText(validator.errors)).true;
  });

  it('should invalidate a invalid schema', async () => {
    expect(validator(invalid)).false;
    expect(validator.errors).deep.eq(expectedErrors);
  });

  const expectedErrors = [
    {
      keyword: 'enum',
      dataPath: '.babel.options.compact',
      schemaPath: 'http://json.schemastore.org/babelrc/properties/compact/enum',
      params: {
        allowedValues: ['auto', true, false],
      },
      message: 'should be equal to one of the allowed values',
    },
    {
      keyword: 'type',
      dataPath: '.jasmineConfigFile',
      schemaPath: '#/properties/jasmineConfigFile/type',
      params: {
        type: 'string',
      },
      message: 'should be string',
    },
    {
      keyword: 'type',
      dataPath: '.jest.config',
      schemaPath: '#/properties/jest/properties/config/type',
      params: {
        type: 'object',
      },
      message: 'should be object',
    },
    {
      keyword: 'type',
      dataPath: '.karma.ngConfig.testArguments',
      schemaPath: '#/definitions/karmaNgConfigOptions/properties/testArguments/type',
      params: {
        type: 'object',
      },
      message: 'should be object',
    },
    {
      keyword: 'enum',
      dataPath: '.tsconfig.moduleResolution',
      schemaPath:
        'http://json.schemastore.org/tsconfig#/definitions/compilerOptionsDefinition/properties/compilerOptions/properties/moduleResolution/anyOf/0/enum',
      params: {
        allowedValues: ['Classic', 'Node'],
      },
      message: 'should be equal to one of the allowed values',
    },
    {
      keyword: 'pattern',
      dataPath: '.tsconfig.moduleResolution',
      schemaPath:
        'http://json.schemastore.org/tsconfig#/definitions/compilerOptionsDefinition/properties/compilerOptions/properties/moduleResolution/anyOf/1/pattern',
      params: {
        pattern: '^(([Nn]ode)|([Cc]lassic))$',
      },
      message: 'should match pattern "^(([Nn]ode)|([Cc]lassic))$"',
    },
    {
      keyword: 'anyOf',
      dataPath: '.tsconfig.moduleResolution',
      schemaPath:
        'http://json.schemastore.org/tsconfig#/definitions/compilerOptionsDefinition/properties/compilerOptions/properties/moduleResolution/anyOf',
      params: {},
      message: 'should match some schema in anyOf',
    },
    {
      keyword: 'type',
      dataPath: '.wct.configFile',
      schemaPath: '#/properties/wct/properties/configFile/type',
      params: {
        type: 'string',
      },
      message: 'should be string',
    },
    {
      keyword: 'type',
      dataPath: '.webpack.configFile',
      schemaPath: '#/properties/webpack/properties/configFile/type',
      params: {
        type: 'string',
      },
      message: 'should be string',
    },
  ];
});
