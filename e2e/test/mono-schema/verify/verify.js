import fs from 'fs';
import { URL, fileURLToPath } from 'url';
import path from 'path';

import ts from 'typescript';
import { expect } from 'chai';
import ajvModule from 'ajv';
import Axios from 'axios';
import { beforeEach } from 'mocha';

/**
 * @type {import('ajv').SchemaObject}
 */
const monoSchema = JSON.parse(
  fs.readFileSync(new URL('../../../node_modules/@stryker-mutator/core/schema/stryker-schema.json', import.meta.url), 'utf-8'),
);
const valid = JSON.parse(fs.readFileSync(new URL('../test/valid.json', import.meta.url), 'utf-8'));
const invalid = JSON.parse(fs.readFileSync(new URL('../test/invalid.json', import.meta.url), 'utf-8'));

const Ajv = ajvModule.default;
const ajv = new Ajv({
  strict: false,
  allErrors: true,
  loadSchema: async (url) => {
    const content = await Axios.get(url);
    delete content.data.$schema;
    return content.data;
  },
});
describe('The Stryker meta schema', () => {
  /**
   * @type {import('ajv').ValidateFunction}
   */
  let validator;
  beforeEach(async () => {
    validator = await ajv.compileAsync(monoSchema);
  });
  it('should validate a valid schema', () => {
    expect(validator(valid), ajv.errorsText(validator.errors)).true;
  });
  it('should invalidate an invalid schema', () => {
    expect(validator(invalid)).false;
    expect(validator.errors.sort(orderByInstancePath)).deep.eq(expectedErrors);
  });
  const expectedErrors = [
    {
      instancePath: '/cucumber/tags',
      keyword: 'type',
      message: 'must be array',
      params: {
        type: 'array',
      },
      schemaPath: '#/properties/cucumber/properties/tags/type',
    },
    {
      instancePath: '/cucumber/features/0',
      keyword: 'type',
      message: 'must be string',
      params: {
        type: 'string',
      },
      schemaPath: '#/properties/cucumber/properties/features/items/type',
    },
    {
      instancePath: '/cucumber/profile',
      keyword: 'type',
      message: 'must be string',
      params: {
        type: 'string',
      },
      schemaPath: '#/properties/cucumber/properties/profile/type',
    },
    {
      keyword: 'type',
      instancePath: '/jasmineConfigFile',
      schemaPath: '#/properties/jasmineConfigFile/type',
      params: {
        type: 'string',
      },
      message: 'must be string',
    },
    {
      keyword: 'type',
      instancePath: '/jest/config',
      schemaPath: '#/properties/jest/properties/config/type',
      params: {
        type: 'object',
      },
      message: 'must be object',
    },
    {
      keyword: 'type',
      instancePath: '/karma/ngConfig/testArguments',
      schemaPath: '#/definitions/karmaNgConfigOptions/properties/testArguments/type',
      params: {
        type: 'object',
      },
      message: 'must be object',
    },
    {
      instancePath: '/tap',
      keyword: 'additionalProperties',
      message: 'must NOT have additional properties',
      params: {
        additionalProperty: 'specFiles',
      },
      schemaPath: '#/properties/tap/additionalProperties',
    },
    {
      instancePath: '/vitest',
      keyword: 'additionalProperties',
      message: 'must NOT have additional properties',
      params: {
        additionalProperty: 'options',
      },
      schemaPath: '#/properties/vitest/additionalProperties',
    },
  ].sort(orderByInstancePath);

  /**
   *
   * @param {import('ajv').ErrorObject} a
   * @param {import('ajv').ErrorObject} b
   * @returns {number}
   */
  function orderByInstancePath(a, b) {
    return a.instancePath.localeCompare(b.instancePath);
  }
});

describe('PartialStrykerOptions', () => {
  ['Node', 'Node16'].forEach((moduleMode) => {
    describe(`with --moduleResolution ${moduleMode}`, () => {
      it('should validate a valid schema', () => {
        const diagnostics = tsc('--moduleResolution', moduleMode, '--module', moduleMode, 'valid.js');
        expect(diagnostics, String(diagnostics[0]?.messageText)).empty;
      });
      it('should invalidate an invalid schema', () => {
        const diagnostics = tsc('--moduleResolution', moduleMode, '--module', moduleMode, 'invalid.js');
        expect(diagnostics).not.empty;

        expect(diagnostics.map(({ messageText }) => messageText).sort()).deep.eq([
          "Type 'string' is not assignable to type '(string | undefined)[]'.",
          "Type '{ name: string; }' is not assignable to type 'string'.",
        ]);
      });
    });
  });
});

/** @param  {...string} args */
function tsc(...args) {
  try {
    process.chdir(fileURLToPath(new URL('../test', import.meta.url)));
    const tsconfigFile = ts.findConfigFile('tsconfig.json', ts.sys.fileExists);
    const { config } = ts.readConfigFile(tsconfigFile, ts.sys.readFile);
    const { fileNames, options } = ts.parseCommandLine(args, (file) => {
      return ts.sys.readFile(file);
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const program = ts.createProgram(fileNames, { ...config.compilerOptions, ...options });
    const emitResult = program.emit();
    const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
    return allDiagnostics;
  } finally {
    process.chdir(path.dirname(fileURLToPath(import.meta.url)));
  }
}
