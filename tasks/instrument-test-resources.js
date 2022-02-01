// @ts-check
import { Instrumenter } from '../packages/instrumenter/dist/src/index.js';
import { readFileSync, writeFileSync } from 'fs';
import { relative } from 'path';
import { File, INSTRUMENTER_CONSTANTS } from '../packages/api/dist/src/core/index.js';
import { fileURLToPath } from 'url';

// @ts-expect-error
const instrumenter = new Instrumenter({
  ...console,
  isDebugEnabled() {
    return true;
  },
});

async function main() {
  await instrument(
    {
      './packages/mocha-runner/testResources/sample-project/MyMath.js': './packages/mocha-runner/testResources/sample-project-instrumented/MyMath.js',
      './packages/mocha-runner/testResources/infinite-loop/infinite-loop.js':
        './packages/mocha-runner/testResources/infinite-loop-instrumented/infinite-loop.js',
    },
    '__stryker2__'
  );
  await instrument(
    {
      './packages/jasmine-runner/testResources/jasmine-init/lib/jasmine_examples/Player.js':
        './packages/jasmine-runner/testResources/jasmine-init-instrumented/lib/jasmine_examples/Player.js',
      './packages/jasmine-runner/testResources/jasmine-init/lib/jasmine_examples/Song.js':
        './packages/jasmine-runner/testResources/jasmine-init-instrumented/lib/jasmine_examples/Song.js',
      './packages/jasmine-runner/testResources/infinite-loop/lib/infinite-loop.js':
        './packages/jasmine-runner/testResources/infinite-loop-instrumented/lib/infinite-loop.js',
    },
    '__stryker2__'
  );
  await instrument({
    './packages/karma-runner/testResources/sampleProject/src/Add.js': './packages/karma-runner/testResources/instrumented/src/Add.js',
    './packages/karma-runner/testResources/sampleProject/src/Circle.js': './packages/karma-runner/testResources/instrumented/src/Circle.js',
    './packages/karma-runner/testResources/infinite-loop/infinite-loop.js':
      './packages/karma-runner/testResources/infinite-loop/infinite-loop.instrumented.js',
  });
  await instrument(
    {
      './packages/jest-runner/testResources/jasmine2-node/src/Add.js': './packages/jest-runner/testResources/jasmine2-node-instrumented/src/Add.js',
      './packages/jest-runner/testResources/jasmine2-node/src/Circle.js':
        './packages/jest-runner/testResources/jasmine2-node-instrumented/src/Circle.js',
    },
    '__stryker2__'
  );
  await instrument(
    {
      './packages/cucumber-runner/testResources/example/src/calculator.js':
        './packages/cucumber-runner/testResources/example-instrumented/src/calculator.js',
      './packages/cucumber-runner/testResources/example/src/calculator-static.js':
        './packages/cucumber-runner/testResources/example-instrumented/src/calculator-static.js',
      './packages/cucumber-runner/testResources/infinite-loop/src/infinite-loop.js':
        './packages/cucumber-runner/testResources/infinite-loop-instrumented/src/infinite-loop.js',
    },
    '__stryker2__'
  );
}

/**
 *
 * @param {object} fromTo
 * @param {'__stryker__' | '__stryker2__'} globalNamespace
 */
async function instrument(fromTo, globalNamespace = INSTRUMENTER_CONSTANTS.NAMESPACE) {
  const files = Object.keys(fromTo).map((fileName) => new File(fileName, readFileSync(fileName)));
  const out = await instrumenter.instrument(files, { plugins: null, excludedMutations: [], mutationRanges: [] });
  out.files.forEach((file) => {
    const toFileName = fromTo[file.name];
    writeFileSync(
      toFileName,
      `// This file is generated with ${relative(process.cwd(), fileURLToPath(import.meta.url))}\n ${file.textContent.replace(
        new RegExp(INSTRUMENTER_CONSTANTS.NAMESPACE, 'g'),
        globalNamespace
      )}`
    );

    console.log(`✅ ${toFileName}`);
  });
}
main();
