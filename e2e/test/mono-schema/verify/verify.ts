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

  it('should invalidate an invalid schema', async () => {
    expect(validator(invalid)).false;
    expect(validator.errors).deep.eq(expectedErrors);
  });

  const expectedErrors = [
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
  ];
});
