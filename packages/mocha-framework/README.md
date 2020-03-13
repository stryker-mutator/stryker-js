[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fstryker%2Fmaster%3Fmodule%3Dmocha-framework)](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/stryker/master?module=mocha-framework)
[![Build Status](https://github.com/stryker-mutator/stryker/workflows/CI/badge.svg)](https://github.com/stryker-mutator/stryker/actions?query=workflow%3ACI+branch%3Amaster)
[![NPM](https://img.shields.io/npm/dm/@stryker-mutator/mocha-framework.svg)](https://www.npmjs.com/package/@stryker-mutator/mocha-framework)
[![Node version](https://img.shields.io/node/v/@stryker-mutator/mocha-framework.svg)](https://img.shields.io/node/v/@stryker-mutator/mocha-framework.svg)
[![Slack Chat](https://img.shields.io/badge/slack-chat-brightgreen.svg?logo=slack)](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM)

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
This README describes how to use the `stryker.conf.js` (or `stryker.conf.json`) config file:

```javascript
// stryker.conf.js
module.exports = {
    // ...
    testFramework: 'mocha',
    coverageAnalysis: 'perTest'
    // ...
}
```
