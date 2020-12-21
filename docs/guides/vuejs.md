---
title: VueJS
custom_edit_url: https://github.com/stryker-mutator/stryker/edit/master/docs/guides/vuejs.md
---

Stryker supports Vue projects. It can mutate both your js/ts files as the script tags in your `*.vue` files.

This article will explain how to configure Stryker with the [vue-cli](https://github.com/vuejs/vue-cli). If you're not using the vue-cli, you'll have to configure Stryker manually.

To get started using Stryker with the vue-cli, first install the core package: `npm i -D @stryker-mutator/core` or `yarn add --dev @stryker-mutator/core`. Next follow the guide for Jest or Mocha based on if you're using the [unit-jest](https://cli.vuejs.org/core-plugins/unit-jest.html) plugin or the [unit-mocha](https://cli.vuejs.org/core-plugins/unit-mocha.html) plugin.

Keep in mind that you may have to change some configuration settings such as paths to files.

## Jest configuration

Follow this guide if you're using the if you're using the [unit-jest](https://cli.vuejs.org/core-plugins/unit-jest.html) plugin.

1. Install the `@stryker-mutator/jest-runner` plugin: `npm i -D @stryker-mutator/jest-runner` or `yarn add --dev @stryker-mutator/jest-runner`.
1. Install `crossenv` (if you haven't already) `npm i -D cross-env@stryker-mutator/jest-runner` plugin.
1. Create a "stryker.conf.json" file that looks like this:
   ```
   {
     "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
     "mutator": {
       "plugins": []
     },
     "tempDirName_comment": "Jest doesn't play nice with the default (.stryker-tmp).",
     "tempDirName": "stryker-tmp",
     "testRunner": "jest",
     "coverageAnalysis": "off",
   }
   ```
1. Add `stryker-tmp` to your `.gitignore` file.
1. Add this script to your package.json:
   ```json
   {
     "scripts": {
       "test:mutation": "cross-env BABEL_ENV=test VUE_CLI_TRANSPILE_BABEL_RUNTIME=true VUE_CLI_BABEL_TARGET_NODE=true VUE_CLI_BABEL_TRANSPILE_MODULES=true stryker run"
     }
   }
   ```

Now give it a go with `npm run test:mutation` or `yarn test:mutation`.

Note that it is important to configure `BABEL_ENV`, `VUE_CLI_TRANSPILE_BABEL_RUNTIME` and `VUE_CLI_BABEL_TARGET_NODE` environment variables. This is done with the `test:mutation` script.

## Mocha configuration

Follow this guide if you're using the if you're using the [unit-mocha](https://cli.vuejs.org/core-plugins/unit-mocha.html) plugin.

To enable Stryker with your vue-cli project, we will have to rebuild parts of the `unit-mocha` plugin in Stryker configuration here. First we'll make unit tests run by running webpack and mocha separately. Next we'll configure Stryker to use it. After following this guide you can also opt to remove the "unit-mocha" vue-cli plugin entirely and use this setup for normal unit testing as well.

### Rebuild unit tests with webpack and mocha

Follow these steps to be able "manually" run webpack and mocha.

1. Install `webpack-cli` and `glob`: `npm i -D webpack-cli glob` or `yarn add --dev webpack-cli glob`.
2. Create a `webpack.stryker.config.js` file with the following content:

   ```js
   // webpack.stryker.config.js
   const glob = require('glob');

   // Set env
   process.env.BABEL_ENV = 'test';
   process.env.NODE_ENV = 'test';
   process.env.VUE_CLI_BABEL_TARGET_NODE = 'true';
   process.env.VUE_CLI_TRANSPILE_BABEL_RUNTIME = 'true';
   process.env.BUILD_ENV = 'testing';

   // Load webpack config
   const conf = require('@vue/cli-service/webpack.config.js');

   // Override the entry files
   conf.entry = {
     // Choose your test files here:
     tests: ['./test/setup-unit.js', ...glob.sync('src/**/*+(spec).js').map((fileName) => `./${fileName}`)],
   };

   module.exports = conf;
   ```

3. Try it out: `npx webpack --config webpack.stryker.config.js`. This should create a `dist` directory with these files `dist/js/chunk-vendors.js` and `dist/js/tests.js`.

   ```
   $ npx webpack --config webpack.stryker.config.js
   Starting type checking service...
   Using 1 worker with 2048MB memory limit


    DONE  Compiled successfully in 5343ms

   Hash: 8a4d024467cd0b96397e
   Version: webpack 4.44.2
   Time: 5343ms
   Built at: 10/06/2020 9:49:20 PM
               Asset      Size  Chunks             Chunk Names
         favicon.ico  4.19 KiB          [emitted]
          index.html  1.02 KiB          [emitted]
         js/tests.js  1000 KiB   tests  [emitted]  tests
        version.json  91 bytes          [emitted]
   Entrypoint tests = js/tests.js
   ```

4. Now test out a test run with `mocha`. Run `npx mocha --require @vue/cli-plugin-unit-mocha/setup.js dist/js/chunk-vendors.js dist/js/tests.js`.

This needs to work first before progressing to the next step. You might need to tweak your `webpack.stryker.config.js` file in order to make this work.

### Configure and run Stryker

Once mocha runs succesfully on the webpack output, you're ready to install and run Stryker:

1. Install the `@stryker-mutator/mocha-runner` plugin: `npm i -D @stryker-mutator/mocha-runner` or `yarn add --dev @stryker-mutator/mocha-runner`.
2. Create your `stryker.conf.json` file:
   ```json
   {
     "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
     "testRunner": "mocha",
     "concurrency": 2,
     "coverageAnalysis": "perTest",
     "symlinkNodeModules": false,
     "buildCommand": "webpack --config webpack.stryker.config.js",
     "mutator": {
       "plugins": []
     },
     "mochaOptions": {
       "package": "package.json",
       "require": ["@vue/cli-plugin-unit-mocha/setup.js"],
       "spec": ["dist/js/chunk-vendors.js", "dist/js/tests.js"]
     }
   }
   ```
3. Add `.stryker-tmp` to your `.gitignore` file.
4. Add this script to your package.json:
   ```json
   {
     "scripts": {
       "test:mutation": "stryker run"
     }
   }
   ```

Now give it a go with `npm run test:mutation` or `yarn test:mutation`.
