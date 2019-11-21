[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fstryker%2Fmaster%3Fmodule%3Djasmine-runner)](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/stryker/master?module=jasmine-runner)
[![Build Status](https://github.com/stryker-mutator/stryker/workflows/CI/badge.svg)](https://github.com/stryker-mutator/stryker/actions?query=workflow%3ACI+branch%3Amaster)
[![NPM](https://img.shields.io/npm/dm/@stryker-mutator/jasmine-runner.svg)](https://www.npmjs.com/package/@stryker-mutator/jasmine-runner)
[![Node version](https://img.shields.io/node/v/@stryker-mutator/jasmine-runner.svg)](https://img.shields.io/node/v/@stryker-mutator/jasmine-runner.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# Stryker Jasmine Runner

A plugin to use Jasmine **as a test runner for node** in [Stryker](https://stryker-mutator.io), the JavaScript mutation testing framework.

## Install

Install @stryker-mutator/jasmine-runner locally within your project folder, like so:

```bash
npm i --save-dev @stryker-mutator/jasmine-runner
```

## Peer dependencies

The `@stryker-mutator/jasmine-runner` is a plugin for `stryker` to enable `jasmine` as a test runner.
As such, you should make sure you have the correct versions of its dependencies installed:

* `jasmine`
* `@stryker-mutator/core`

## Configuring

You can configure the jasmine test runner in the `stryker.conf.js` file.

```javascript
// stryker.conf.js
module.exports = function (config) {
    config.set({
        // ...
        // not required, but boosts performance
        coverageAnalysis: 'perTest',
        // not required, but will allow you to use coverageAnalysis "perTest". Note: This requires `stryker-jasmine` to also be installed.
        testFramework: 'jasmine',
        testRunner: 'jasmine',
        jasmineConfigFile: 'spec/support/jasmine.json'
        // ...
    });
}
```

### `jasmineConfigFile` [`string`]

Default: `undefined`

Specify your [jasmine configuration file](https://jasmine.github.io/setup/nodejs.html#configuration) to be loaded.
Leaving this blank will result in the jasmine defaults, which are undocumented (see [source code here](https://github.com/jasmine/jasmine-npm/blob/master/lib/jasmine.js#L10-L38)).
