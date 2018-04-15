[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/stryker-karma-runner.svg)](https://www.npmjs.com/package/stryker-karma-runner)
[![Node version](https://img.shields.io/node/v/stryker-karma-runner.svg)](https://img.shields.io/node/v/stryker-karma-runner.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# Stryker Karma Runner

A plugin to use the karma test runner in [Stryker](https://stryker-mutator.io), the JavaScript mutation testing framework

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

You can configure the `stryker-karma-runner` using the `stryker.conf.js` config file.

```javascript
// Stryker.conf.js
module.exports = function (config) {
    config.set({
        // ...
        testRunner: 'karma',
        // ...
        karmaConfig: {
            files: ['src/**/*.js'] // <-- override karma config here
        },
        karmaConfigFile: 'karma.conf.js' // <-- add your karma.conf.js file here
    });
}
```

### `karmaConfigFile` [`string`]

Default: `undefined`

Specify a ['karma.conf.js' file](http://karma-runner.github.io/2.0/config/configuration-file.html) to be loaded. Options specified directly in your stryker.conf.js file will overrule options from karma's configuration file.

### `karmaConfig.files` [`(string | FilePattern)[]`]

Default: `[]`

The files array determines which files are included in the browser and which files are watched and served by Karma. See [the files section on the karma website](http://karma-runner.github.io/2.0/config/files.html).

### `karmaConfig.browsers` [`string[]`]

Default: `['PhantomJS']`

Configure the karma [Browsers configuration setting](http://karma-runner.github.io/2.0/config/browsers.html).

### `karmaConfig.*` [`any`]

Use other options to configure karma. See [the configuration section on the karma website](http://karma-runner.github.io/2.0/config/configuration-file.html)

The browser's life cycle is determined by `stryker-karma-runner`. I.e. these settings cannot be overridden:

```javascript
{
  autoWatch: false,
  singleRun: false,
}
```

The `coverage` plugin will also be removed (not needed for mutation testing).

## Full config example

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
        coverageAnalysis: 'perTest',
        plugins: ['stryker-karma-runner'] // Or leave out the plugin list entirely to load all stryker-* plugins directly
        // ...
    });
}
```

## Debugging

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
