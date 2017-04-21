[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/stryker-karma-runner.svg)](https://www.npmjs.com/package/stryker-karma-runner)
[![Node version](https://img.shields.io/node/v/stryker-karma-runner.svg)](https://img.shields.io/node/v/stryker-karma-runner.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# Stryker Karma Runner

A plugin to use the karma test runner in [Stryker](https://stryker-mutator.github.io), the JavaScript mutation testing framework

## Install

Install stryker-karma-runner locally within your project folder, like so:

```bash
npm i --save-dev stryker-karma-runner
```

## Peer dependencies

The `stryker-karma-runner` is a plugin for `stryker` to enable `karma` as a test runner. 
As such, you should make sure you have the correct versions of its dependencies installed:

* `karma`
* `stryker-api`

For the current versions, see the `peerDependencies` section in the [package.json](https://github.com/stryker-mutator/stryker/blob/master/packages/stryker-karma-runner/package.json).

These are marked as `peerDependencies` of `stryker-karma-runner` so you get a warning during installation when the correct versions are not installed.
*Note*: Karma itself also requires some plugins to work.  

## Configuring

You can either configure the karma test runner using the command line or by providing it in the `stryker.conf.js` file.
This README describes how to use the `stryker.conf.js` config file.

### Load the plugin

In order to use the `stryker-karma-runner` it must me loaded in the stryker mutation testing framework via the stryker configuration. 
The easiest way to achieve this, is *not have a `plugins` section* in your config file. That way, all `node_modules` starting with `stryker-` will be loaded.

If you do decide to choose specific modules, don't forget to add `'stryker-karma-runner'` to the list of plugins to load.

### Use the test runner

In order to use karma as the test runner, you simply specify it in your config file: `testRunner: 'karma'`

### Karma config

#### Automatic setup

You can configure stryker to use *your very own* `karma.conf.js` file. 

```javascript
// Stryker.conf.js
module.exports = function (config) {
    config.set({
        testRunner: 'karma',
        testFramework: 'jasmine', // <-- add your testFramework here
        karmaConfigFile: 'karma.conf.js' // <-- add your karma.conf.js file here
        mutate: [
            'src/**/*.js' // <-- mark files for mutation here
        ]
    });
}
```

This will configure three things for you:

* Karma's `files` option will be used to configure the files in Stryker, you don't need to keep a list of files in sync in both `stryker.conf.js` and `karma.conf.js`.
* Karma's `exclude` option will be used to ignore files in Stryker (using `!` to ignore them)
* All remaining karma config options will be copied to the `karmaConfig` option in Stryker config. They will be picked up by the `stryker-karma-runner` during mutation testing.
    * **Note**: Any manual setup you configure in the `karmaConfig` options will *not* be overwritten.

#### Manual setup

**Note**: Using the manual setup will not read your `karma.conf.js` options. You'll probably need to *Override the karma config* (see next section)

When Stryker uses the karma test runner, it uses these default karma config settings:


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

The following Karma config options cannot be overridden:

* `files`: The karma-runner will fill this based on the `files` and `mutate` configuration in the `stryker-conf.js` file (or your `karma.conf.js` file when using the *automatic setup*).
* `coverageReporter`: For the initial test run, the `stryker-karma-runner` will use its own coverage reporter. For testing the mutants, however, it will be disabled.
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

As Stryker runs karma in its own process, its logging output will be consumed by Stryker.

To see all logging from karma, set the log level to `trace` in `stryker.conf.js`.

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
