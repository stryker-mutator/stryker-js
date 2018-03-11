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

You can either configure the mocha test runner using the command line or by providing it in the `stryker.conf.js` file.
This README describes how to use the `stryker.conf.js` config file:

```javascript
// stryker.conf.js
module.exports = function (config) {
    config.set({
        // ...
        testRunner: 'mocha',
        // ...
        mochaOptions: {
            // Optional mocha options
            opts: 'path/to/mocha.opts',
            ui: 'bdd',
            require: [ /*'babel-register' */],
            asyncOnly: false
        }
    });
}
```

You can pass mocha options in 2 ways: either specify a mocha.opts file or configure `mochaOptions` in stryker.conf.js. When both are specified, the values in stryker.conf.js will overrule the values in your mocha.opts file.

The only supported mocha options are: `--ui`, `--require`, `--async-only` (or their short form counterparts). Others are ignored by the stryker-mocha-runner.