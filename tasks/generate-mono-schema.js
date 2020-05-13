// @ts-check
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const resolveFromParent = path.resolve.bind(path, __dirname, '..');
const globAsPromised = promisify(glob);

/**
 * Build the mono schema based on all schemas from the plugin as well as the Stryker core schema
 */
async function buildMonoSchema() {
  const schemaFiles = await globAsPromised('packages/!(core)/schema/*.json', { cwd: resolveFromParent() });
  const allContent = await Promise.all(schemaFiles.map(schemaFile => readFile(resolveFromParent(schemaFile), 'utf8')))
  const allSchemas = allContent.map(content => JSON.parse(content));
  const monoSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'StrykerMonoSchema',
    description: 'Options for Stryker for JS and TypeScript and all officially supported plugins.',
    type: 'object',
    properties: allSchemas.reduce((props, schema) => ({ ...props, ...schema.properties }), {}),
    definitions: allSchemas.reduce((props, schema) => ({ ...props, ...schema.definitions }), {})
  }
  const outFile = resolveFromParent('packages', 'core', 'schema', 'stryker-schema.json');
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, JSON.stringify(monoSchema, null, 2));
  console.info(`✅ Merged ${schemaFiles.length} schemas into ${path.relative(resolveFromParent(), outFile)}`);
}
buildMonoSchema().catch(console.error);
