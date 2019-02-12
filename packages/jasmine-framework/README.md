[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/@stryker-mutator/jasmine-framework.svg)](https://www.npmjs.com/package/@stryker-mutator/jasmine-framework)
[![Node version](https://img.shields.io/node/v/@stryker-mutator/jasmine-framework.svg)](https://img.shields.io/node/v/@stryker-mutator/jasmine-framework.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker Jasmine
A plugin to use the Jasmine test framework in [Stryker](https://stryker-mutator.io), the JavaScript mutation testing framework.

This plugin provides beforeEach, afterEach and filter hooks to Stryker, so you are able to use `coverageAnalysis: 'perTest'` with jasmine.

## Installation

Install `@stryker-mutator/jasmine-framework` and `jasmine-core` into your project via npm:

```bash
$ npm install @stryker-mutator/jasmine-framework jasmine-core --save-dev
```

*Note: @stryker-mutator/jasmine-framework only works with jasmine-core >= v2*

Since @stryker-mutator/jasmine-framework is a plugin for Stryker, you likely have it installed already, but in case you don't:

```bash
$ npm install @stryker-mutator/core --save-dev
```

## Configuration

Set the `testFramework` setting to `'jasmine'` in your stryker config file.

```javascript
// stryker.conf.js
module.exports = function(config) {
  config.set({
    testFramework: 'jasmine',
  });
};
```

You can also pass `--testFramework jasmine` as command line argument when running stryker.

See the [Stryker](https://github.com/stryker-mutator/stryker) main readme for more information on how to choose the (test) files and other options.
