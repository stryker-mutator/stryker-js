// @ts-check
const strykerCoreSchema = require('../schema/stryker-core')
const { compile } = require('json-schema-to-typescript');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const resolveGeneratedSrc = path.resolve.bind(path, __dirname, '..', 'src-generated');

async function generate() {
  const schema = preprocessSchema(strykerCoreSchema);
  if (!await exists(resolveGeneratedSrc())) {
    await mkdir(resolveGeneratedSrc());
  }
  const ts = await compile(schema, 'core', {
    enableConstEnums: true,
    style: {
      singleQuote: true,
    }
  });
  await writeFile(resolveGeneratedSrc('core.d.ts'), ts, 'utf8');
}

generate().catch(err => {
  console.error('TS generation failed', err);
  process.exitCode = 1;
});


function preprocessSchema(inputSchema) {
  switch (inputSchema.type) {
    case 'object':
      const inputRequired = inputSchema.required || [];
      const outputSchema = {
        ...inputSchema,
        properties: preprocessProperties(inputSchema.properties),
        definitions: preprocessProperties(inputSchema.definitions),
        required: Object.entries(inputSchema.properties)
          .filter(([name, value]) => 'default' in value || inputRequired.indexOf(name) >= 0)
          .map(([name]) => name)
      }
      if (inputSchema.definitions) {
        outputSchema.definitions = preprocessProperties(inputSchema.definitions);
      }
      return outputSchema;
    case 'array':
      return {
        ...inputSchema,
        items: preprocessSchema(inputSchema.items)
      }
    default:
      if (inputSchema.$ref) {
        // Workaround for: https://github.com/bcherny/json-schema-to-typescript/issues/193
        return {
          $ref: inputSchema.$ref
        }
      }
      return inputSchema;
  }
}

function preprocessProperties(inputProperties) {
  if (inputProperties) {
    const outputProperties = {};
    Object.entries(inputProperties).forEach(([name, value]) => outputProperties[name] = preprocessSchema(value));
    return outputProperties;
  }
}
