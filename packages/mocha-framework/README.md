[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fstryker%2Fmaster%3Fmodule%3Dmocha-framework)](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/stryker/master?module=mocha-framework)
[![Build Status](https://github.com/stryker-mutator/stryker/workflows/CI/badge.svg)](https://github.com/stryker-mutator/stryker/actions?query=workflow%3ACI+branch%3Amaster)
[![NPM](https://img.shields.io/npm/dm/@stryker-mutator/mocha-framework.svg)](https://www.npmjs.com/package/@stryker-mutator/mocha-framework)
[![Node version](https://img.shields.io/node/v/@stryker-mutator/mocha-framework.svg)](https://img.shields.io/node/v/@stryker-mutator/mocha-framework.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# Stryker Mocha Framework

A plugin to speed up [Mocha](http://mochajs.org/) tests in [Stryker](https://stryker-mutator.io), the JavaScript mutation testing framework.

This plugin makes it possible for Stryker to use `coverageAnalysis: 'perTest'`, by providing the abstraction to select which individual test(s) to run. You might also be looking for the [stryker-mocha-runner](https://www.npmjs.com/package/stryker-mocha-runner), which makes it possible to use the node-based Mocha test runner in stryker.

## Install

Install @stryker-mutator/mocha-framework locally within your project folder, like so:

```bash
npm i --save-dev @stryker-mutator/mocha-framework
```

## Peer dependencies

The `@stryker-mutator/mocha-framework` is a plugin to use `mocha` for `stryker` as a test framework.
As such, you should make sure you have the correct versions of its dependencies installed:

* `@stryker-mutator/core`
* `mocha`

## Configuring

You can either configure the mocha test framework using the command line or by providing it in the `stryker.conf.js` file.
This README describes how to use the `stryker.conf.js` config file:

```javascript
// Stryker.conf.js
module.exports = function (config) {
    config.set({
        ...
        testFramework: 'mocha',
        coverageAnalysis: 'perTest'
        ...
    });
}
```
