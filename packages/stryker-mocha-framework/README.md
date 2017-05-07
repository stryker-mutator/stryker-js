[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/stryker-mochaframework.svg)](https://www.npmjs.com/package/stryker-framework)
[![Node version](https://img.shields.io/node/v/stryker-mocha-framework.svg)](https://img.shields.io/node/v/stryker-mocha-framework.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
# Stryker Mocha Framework
A plugin to speed up Mocha tests in [Stryker](https://stryker-mutator.github.io), the JavaScript mutation testing framework.

This module is optional and does require a corresponding test runner such as [stryker-mocha-runner](https://www.npmjs.com/package/stryker-mocha-runner).

## Install

Install stryker-mocha-framework locally within your project folder, like so:

```bash
npm i --save-dev stryker-mocha-framework
```

## Peer dependencies

The `stryker-mocha-framework` is a plugin for `stryker` as a test framework. 
As such, you should make sure you have the correct versions of its dependencies installed:

* `stryker-api`

## Configuring

You can either configure the mocha test framework using the command line or by providing it in the `stryker.conf.js` file.
This README describes how to use the `stryker.conf.js` config file:
```
// Stryker.conf.js
module.exports = function (config) {
    config.set({
        ...
        testFramework: 'mocha',
        ...
    });
}
```
