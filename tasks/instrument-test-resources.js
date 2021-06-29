// @ts-check
const { Instrumenter } = require('../packages/instrumenter');
const fs = require('fs');
const path = require('path');
const { File, INSTRUMENTER_CONSTANTS } = require('../packages/api/core');

// @ts-expect-error
const instrumenter = new Instrumenter({
  ...console,
  isDebugEnabled() { return true; }
});

async function main() {
  await instrument(['./packages/mocha-runner/testResources/sample-project/MyMath.js'],
    './packages/mocha-runner/testResources/sample-project-instrumented',
    '__stryker2__');
  await instrument([
    './packages/jasmine-runner/testResources/jasmine-init/lib/jasmine_examples/Player.js',
    './packages/jasmine-runner/testResources/jasmine-init/lib/jasmine_examples/Song.js'
  ], './packages/jasmine-runner/testResources/jasmine-init-instrumented/lib/jasmine_examples',
    '__stryker2__');
  await instrument([
    './packages/karma-runner/testResources/sampleProject/src/Add.js',
    './packages/karma-runner/testResources/sampleProject/src/Circle.js',
  ], './packages/karma-runner/testResources/instrumented/src')
  await instrument([
    './packages/jest-runner/testResources/jasmine2-node/src/Add.js',
    './packages/jest-runner/testResources/jasmine2-node/src/Circle.js',
  ], './packages/jest-runner/testResources/jasmine2-node-instrumented/src',  '__stryker2__')
  await instrument(['./packages/cucumber-runner/testResources/example/src/calculator.js',
  './packages/cucumber-runner/testResources/example/src/calculator-static.js'], 
  './packages/cucumber-runner/testResources/example-instrumented/src', '__stryker2__')
}

/**
 * 
 * @param {string[]} from 
 * @param {string} to 
 * @param {'__stryker__' | '__stryker2__'} globalNamespace 
 */
async function instrument(from, to, globalNamespace = INSTRUMENTER_CONSTANTS.NAMESPACE) {
  const files = from.map(fileName => new File(path.basename(fileName), fs.readFileSync(fileName)));
  const out = await instrumenter.instrument(files, { plugins: null, excludedMutations: [], mutationRanges: [] });
  out.files.forEach(file => {
    const toFileName = path.resolve(to, file.name);
    fs.writeFileSync(toFileName, `// This file is generated with ${path.relative(process.cwd(), __filename)}\n ${file.textContent.replace(new RegExp(INSTRUMENTER_CONSTANTS.NAMESPACE, 'g'), globalNamespace)}`);
    console.log(`✅ ${toFileName}`);
  });
}
main();
