[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/stryker-mocha-runner.svg)](https://www.npmjs.com/package/stryker-mocha-runner)
[![Node version](https://img.shields.io/node/v/stryker-mocha-runner.svg)](https://img.shields.io/node/v/stryker-mocha-runner.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# Stryker Mocha Runner
A plugin to use Mocha in [Stryker](https://stryker-mutator.io), the JavaScript mutation testing framework.

**IMPORTANT:** Starting from `stryker-mocha-runner@0.4.0` the test framework has been moved to a separate module. Please also install `stryker-mocha-framework` if you've previously used this module.

## Install

Install stryker-mocha-runner locally within your project folder, like so:

```bash
npm i --save-dev stryker-mocha-runner
```

## Peer dependencies

The `stryker-mocha-runner` is a plugin for `stryker` to enable `mocha` as a test runner. 
As such, you should make sure you have the correct versions of its dependencies installed:

* `mocha`
* `stryker-api`

## Configuring

You can configure the mocha test runner in the `stryker.conf.js` file.

```javascript
// stryker.conf.js
module.exports = function (config) {
    config.set({
        // ...
        testRunner: 'mocha',
        // ...
        mochaOptions: {
            // Optional mocha options
            files: [ 'test/**/*.js' ]
            opts: 'path/to/mocha.opts',
            ui: 'bdd',
            timeout: 3000,
            require: [ /*'babel-register' */],
            asyncOnly: false
        }
    });
}
```

### `mochaOptions.files` [`string` or `string[]`]

Default: `'test/**/*.js'`

Choose which files to include. This is comparable to [mocha's test directory](https://mochajs.org/#the-test-directory) although there is no support for `--recursive`.

If you want to load all files recursively: use a globbing expression (`'test/**/*.js'`). If you want to decide on the order of files, use multiple globbing expressions. For example: use `['test/helpers/**/*.js', 'test/unit/**/*.js']` if you want to make sure your helpers are loaded before your unit tests.

### `mochaOptions.opts` [`string`]

Default: `undefined`

Specify a ['mocha.opts' file](https://mochajs.org/#mochaopts) to be loaded. Options specified directly in your stryker.conf.js file will overrule options from the 'mocha.opts' file.

The only supported mocha options are used: `--ui`, `--require`, `--async-only`, `--timeout` (or their short form counterparts). Others are ignored by the stryker-mocha-runner.

### `mochaOptions.ui` [`string`]

Default: `undefined`

Set the name of your [mocha ui](https://mochajs.org/#-u---ui-name)

### `mochaOptions.require` [`string[]`]

Default: `[]`

Set mocha's [`require` option](https://mochajs.org/#-r---require-module-name)

### `mochaOptions.asyncOnly` [`boolean`]

Default: `false`

Set mocha's [`asyncOnly` option](https://mochajs.org/#usage)

### `mochaOptions.timeout` [`number`]

Default: `undefined`

Set mocha's [`timeout` option](https://mochajs.org/#-t---timeout-ms)