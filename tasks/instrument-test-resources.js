const { Instrumenter } = require('../packages/instrumenter');
const fs = require('fs');
const path = require('path');
const { File, INSTRUMENTER_CONSTANTS } = require('../packages/api/core');

const instrumenter = new Instrumenter({
  ...console,
  isDebugEnabled() { return true; }
});

async function main() {
  await instrument(['./packages/mocha-runner/testResources/sample-project/MyMath.js'],
    './packages/mocha-runner/testResources/sample-project-instrumented', '__stryker2__');
  await instrument([
    './packages/jasmine-runner/testResources/jasmine-init/lib/jasmine_examples/Player.js',
    './packages/jasmine-runner/testResources/jasmine-init/lib/jasmine_examples/Song.js'
  ], './packages/jasmine-runner/testResources/jasmine-init-instrumented/lib/jasmine_examples');
  await instrument([
    './packages/karma-runner/testResources/sampleProject/src/Add.js',
    './packages/karma-runner/testResources/sampleProject/src/Circle.js',
  ], './packages/karma-runner/testResources/instrumented/src')
}

async function instrument(from, to, globalNamespace = INSTRUMENTER_CONSTANTS.NAMESPACE) {
  const files = from.map(fileName => new File(path.basename(fileName), fs.readFileSync(fileName)));
  const out = await instrumenter.instrument(files, { plugins: null });
  out.files.forEach(file => {
    const toFileName = path.resolve(to, file.name);
    fs.writeFileSync(toFileName, `// This file is generated with ${path.relative(process.cwd(), __filename)}\n ${file.textContent.replace(new RegExp(INSTRUMENTER_CONSTANTS.NAMESPACE, 'g'), globalNamespace)}`);
    console.log(`✅ ${toFileName}`);
  });
}
main();
