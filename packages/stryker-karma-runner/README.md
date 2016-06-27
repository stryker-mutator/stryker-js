[![Build Status](https://travis-ci.org/stryker-mutator/stryker-karma-runner.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker-karma-runner)
[![NPM](https://img.shields.io/npm/dm/stryker-karma-runner.svg)](https://www.npmjs.com/package/stryker-karma-runner)
[![Node version](https://img.shields.io/node/v/stryker-karma-runner.svg)](https://img.shields.io/node/v/stryker-karma-runner.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

#Stryker Karma Runner

A plugin to use the karma test runner in [Stryker](https://stryker-mutator.github.io), the JavaScript mutation testing framework

## Warning

The stryker-karma-runner is available from stryker v0.4.0 onward.

## Install

Install stryker-karma-runner from your project folder:

```bash
npm i --save-dev stryker-karma-runner
```

## Peer dependencies

The `stryker-karma-runner` is a pluggin for `stryker` to enable `karma` as a test runner. As such you should install the correct versions of the dependencies:

* `karma`: version ^0.13.0 || ^1.0.0
* `karma-coverage`: version ^0.5.5 || ^1.0.0
* `stryker-api`: version ^0.0.2

These are marked as `peerDependencies` of `stryker-karma-runner` so you should get a warning when the correct versions are not installed.
*Note*: Karma itself also requires some plugins to work.  

## Configuring

You can either configure the karma test runner from the `stryker.conf.js` file or from the command line. This readme describes how to do it via the config file.

### Load the plugin

In order to use the `stryker-karma-runner` it must me loaded in the stryker mutation testing framework via the stryker configuration. 
Easiest is to *leave out* the `plugins` section from your config entirely. That way, all node_modules starting with `stryker-` will be loaded.

If you do decide to choose specific modules, don't forget to add `'stryker-karma-runner'` to the list of plugins to load.

### Use the test runner

Specify the use of the karma testRunner: `testRunner: 'karma'`.

### Karma config

When the Stryker uses the karma test runner, it uses these default karma config settings:

```javascript
{
  browsers: ['PhantomJS'], // *
  frameworks: ['jasmine'], // *
  autoWatch: false,
  singleRun: false,
}
// * these settings can be overriden, see next paragraph
```

For the first test run, stryker enables code coverage. If so, these additional settings are used:

```javascript
  coverageReporter: {
    type: 'in-memory' 
  },
  preprocessors: {
    'src/file1.js': 'coverage', // for each file to be mutated
    'src/file2.js': 'coverage'
  },
  plugins: ['karma-coverage'] // or left blank (by default, karma loads all plugins starting with karma-*
```

#### Override karma config

You can override karma config by adding a `karmaConfig` property to your `stryker.conf.js` file.

For example:

```javascript
karmaConfig: {
    browsers: ['Chrome'],
    frameworks: ['mocha']
}
```

*Note*: Whichever testFramework you use should also be reflected in the `testFramework` property of stryker itself. For example: `testFramework: 'mocha'`  

Not all karma config can be overriden, as Stryker requires specific functionality from the testRunner to do its magic. 
Karma config that *cannot* be overriden:

* `files`: The karma-runner will fill this based on the `files` and `filesToMutate` configuration in the `stryker-conf.js` file.
* `coverageReporter`: This will be enabled for the initial test run, disabled for testing the mutants.
* `autoWatch`, `singleRun`: Stryker needs full control on when to run the karma tests

### Full config example

```javascript
// stryker.conf.js
exports = function(config){
    config.set({
        // ...
        testRunner: 'karma',
        testFramework: 'jasmine',
        karmaConfig: { // these are the defaults
            browsers: ['PhantomJS'],
            frameworks: ['jasmine'],
            autoWatch: false,
            singleRun: false
        },
        plugins: ['stryker-karma-runner'] // Or leave out the plugin list entirely to load all stryker-* plugins directly
        // ...
    });
}
```

## Usage

Use Stryker as you normally would.
See [http://stryker-mutator.github.io](http://stryker-mutator.github.io) for more info. 

### Debugging

By default, karma logging will be swallowed. 
Set log level to `trace` in `stryker.conf.js` to see all the karma output.

```javascript
// stryker.conf.js
exports = function(config){
    config.set({
        // ...
        logLevel: 'trace'
        // ...
    });
}
```