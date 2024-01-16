// @ts-check
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, relative } from 'path';

import { fileURLToPath } from 'url';

import { INSTRUMENTER_CONSTANTS } from '../packages/api/dist/src/core/index.js';
import { Instrumenter } from '../packages/instrumenter/dist/src/index.js';

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
    '__stryker2__',
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
    '__stryker2__',
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
    '__stryker2__',
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
    '__stryker2__',
  );
  await instrument(
    {
      './packages/tap-runner/testResources/example/src/math.js': './packages/tap-runner/testResources/example-instrumented/src/math.js',
      './packages/tap-runner/testResources/example/src/formatter.js': './packages/tap-runner/testResources/example-instrumented/src/formatter.js',
    },
    '__stryker2__',
  );
  await instrument(
    { './packages/vitest-runner/testResources/simple-project/math.orig.ts': './packages/vitest-runner/testResources/simple-project/math.ts' },
    '__stryker2__',
  );
  await instrument(
    {
      './packages/vitest-runner/testResources/infinite-loop/lib/infinite-loop.orig.js':
        './packages/vitest-runner/testResources/infinite-loop/lib/infinite-loop.js',
    },
    '__stryker2__',
  );
  await instrument(
    {
      './packages/vitest-runner/testResources/workspaces/packages/bar/src/math.orig.js':
        './packages/vitest-runner/testResources/workspaces/packages/bar/src/math.js',
      './packages/vitest-runner/testResources/workspaces/packages/foo/src/math.orig.js':
        './packages/vitest-runner/testResources/workspaces/packages/foo/src/math.js',
    },
    '__stryker2__',
  );
  await instrument(
    {
      './packages/vitest-runner/testResources/async-failure/src/add.orig.ts': './packages/vitest-runner/testResources/async-failure/src/add.ts',
    },
    '__stryker2__',
  );
  await instrument(
    {
      './packages/vitest-runner/testResources/browser-project/src/heading.component.orig.ts':
        './packages/vitest-runner/testResources/browser-project/src/heading.component.ts',
      './packages/vitest-runner/testResources/browser-project/src/math.component.orig.ts':
        './packages/vitest-runner/testResources/browser-project/src/math.component.ts',
    },
    '__stryker2__',
  );
}

/**
 *
 * @param {Record<string,string>} fromTo
 * @param {'__stryker__' | '__stryker2__'} globalNamespace
 */
async function instrument(fromTo, globalNamespace = INSTRUMENTER_CONSTANTS.NAMESPACE) {
  const files = Object.keys(fromTo).map((fileName) => ({ mutate: true, name: fileName, content: readFileSync(fileName, 'utf-8') }));
  const out = await instrumenter.instrument(files, { plugins: null, excludedMutations: [], ignorers: [] });
  out.files.forEach((file) => {
    const toFileName = fromTo[file.name];
    mkdirSync(dirname(toFileName), { recursive: true });
    writeFileSync(
      toFileName,
      `// This file is generated with ${relative(process.cwd(), fileURLToPath(import.meta.url))}\n ${file.content.replace(
        new RegExp(INSTRUMENTER_CONSTANTS.NAMESPACE, 'g'),
        globalNamespace,
      )}`,
    );

    console.log(`✅ ${toFileName}`);
  });
}
main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
