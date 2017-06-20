[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/stryker.svg)](https://www.npmjs.com/package/stryker)
[![Node version](https://img.shields.io/node/v/stryker.svg)](https://img.shields.io/node/v/stryker.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![BCH compliance](https://bettercodehub.com/edge/badge/stryker-mutator/stryker)](https://bettercodehub.com/)

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

The main `command` for Stryker is `run`, which kicks off mutation testing.

By default, we expect a `stryker.conf.js` file in the current working directory. This can be overridden by specifying a different file as the last parameter.

Before your first run, we recommend you try the `init` command, which helps you to set up this `stryker.conf.js` file and install any missing packages needed for your specific configuration. We recommend you verify the contents of the configuration file after this initialization, to make sure everything is setup correctly. Of course, you can still make changes to it, before you run Stryker for the first time.

The following is an example `stryker.conf.js` file:

```javascript
module.exports = function(config){
  config.set({
    files: ['test/helpers/**/*.js', 
            'test/unit/**/*.js', 
            { pattern: 'src/**/*.js', included: false, mutated: true }
            { pattern: 'src/templates/*.html', included: false, mutated: false }
            '!src/fileToIgnore.js'],
    testFramework: 'mocha',
    testRunner: 'mocha',
    reporter: ['progress', 'clear-text', 'dots', 'html', 'event-recorder'],
    coverageAnalysis: 'perTest',
    plugins: ['stryker-mocha-runner', 'stryker-html-reporter']
  });
}
```

As you can see, the config file is *not* a simple JSON file. It should be a common js (a.k.a. node) module. You might recognize this way of working from the karma test runner.

Make sure you *at least* specify the `files` and the `testRunner` options when mixing the config file and/or command line options.

## Command-line interface
Stryker can also be installed, configured and run using the [Stryker-CLI](https://github.com/stryker-mutator/stryker-cli). If you plan on using Stryker in more projects, the Stryker-CLI is the easiest way to install, configure and run Stryker for your project.

You can install the Stryker-CLI using:

```
$ npm install -g stryker-cli
```

The Stryker-CLI works by passing received commands to your local Stryker installation. If you don't have Stryker installed yet, the Stryker-CLI will help you with your Stryker installation. This method allows us to provide additional commands with updates of Stryker itself.

## Supported mutators  
See our website for the [list of currently supported mutators](http://stryker-mutator.github.io/mutators.html).

## Configuration  
See the [stryker's package readme](https://github.com/stryker-mutator/stryker/blob/master/packages/stryker/README.md#configuration) for all config options.