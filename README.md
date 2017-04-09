[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/stryker.svg)](https://www.npmjs.com/package/stryker)
[![Node version](https://img.shields.io/node/v/stryker.svg)](https://img.shields.io/node/v/stryker.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

![Stryker](stryker-80x80.png)

# Stryker
*Professor X: For someone who hates mutants... you certainly keep some strange company.*  
*William Stryker: Oh, they serve their purpose... as long as they can be controlled.*

## Introduction
For an introduction to mutation testing and Stryker's features, see [stryker-mutator.github.io](http://stryker-mutator.github.io/).

## Getting started
Stryker is a mutation testing framework for JavaScript. It allows you to test your tests by temporarily inserting bugs.

To install Stryker, execute the command:
```sh
$ npm install stryker stryker-api --save-dev
```

***Note:*** *During installation you may run into errors caused by [node-gyp](https://github.com/nodejs/node-gyp). It is safe to ignore them.*

To test if Stryker is installed correctly, execute the command:
```sh
$ node_modules/.bin/stryker --version
```

This should print the latest version of Stryker.

## Usage

```sh
$ node_modules/.bin/stryker <command> [options] [stryker.conf.js]
```

The only `command` currently available is `run`, which kicks off mutation testing.

By default, we expect a `stryker.conf.js` file in the current working directory. This can be overridden by specifying a different file as the last parameter.

The following is an example `stryker.conf.js` file:

```javascript
module.exports = function(config){
  config.set({
    files: ['test/helpers/**/*.js', 'test/unit/**/*.js', { pattern: 'src/**/*.js', included: false, mutated: true }],
    testFramework: 'mocha',
    testRunner: 'mocha',
    reporter: ['progress', 'clear-text', 'dots', 'html', 'event-recorder'],
    coverageAnalysis: 'perTest',
    plugins: ['stryker-mocha-runner', 'stryker-html-reporter']
  });
}
```

As you can see, the config file is *not* a simple JSON file, it should be a common js (a.k.a. npm) module.  
You might recognize this way of working from the karma test runner.

Make sure you *at least* specify the `files` and the `testRunner` options when mixing the config file and/or command line options.

## Supported mutators  
See our website for the [list of currently supported mutators](http://stryker-mutator.github.io/mutators.html).

## Configuration  
See the [stryker's package readme](https://github.com/stryker-mutator/stryker/blob/master/packages/stryker/README.md#configuration) for all config options.