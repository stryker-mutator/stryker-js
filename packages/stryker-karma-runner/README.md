[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/stryker-karma-runner.svg)](https://www.npmjs.com/package/stryker-karma-runner)
[![Node version](https://img.shields.io/node/v/stryker-karma-runner.svg)](https://img.shields.io/node/v/stryker-karma-runner.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# Stryker Karma Runner

A plugin to use the karma test runner (or [@angular/cli](https://www.npmjs.com/package/@angular/cli)'s `ng test`) in [Stryker](https://stryker-mutator.io), the JavaScript mutation testing framework

## Install

Install stryker-karma-runner locally within your project folder, like so:

```bash
npm i --save-dev stryker-karma-runner
```

## Bring your own test runner

The `stryker-karma-runner` is a plugin for `stryker` to enable `karma` as a test runner. 
However, it does *not* come packaged with it's own version of `karma`, instead it 
uses *your very own karma* version. It can also work with `@angular/cli`, see [Configuring](#configuring)

## Configuring

You can configure the `stryker-karma-runner` using the `stryker.conf.js` config file.

```javascript
// Stryker.conf.js
module.exports = function (config) {
    config.set({
        // ...
        testRunner: 'karma',
        // ...
        karma: {
            project: 'custom', // or 'angular-cli'
            configFile: 'path/to/karma.conf.js' // default `undefined`
            config: { // default `undefined`
                browsers: ['ChromeHeadless'] // override config settings
            }
        }
    });
}
```

### `karma.project` [`"custom"` | `"angular-cli"`]

Default: `"custom"`

Specify which kind of project you're using. This determines which command is used to start karma

* **`"custom"`**: configure stryker-karma-runner to use `karma start`.
* **`"angular-cli"`**: configure stryker-karma-runner to use `ng test` (see [configuring for angular-cli](#configure-angular-cli)).

### `karma.configFile` [`string`]

Default: `undefined`

Specify a ['karma.conf.js' file](http://karma-runner.github.io/2.0/config/configuration-file.html) to be loaded. 
Options specified directly in your stryker.conf.js file using `karma.config` will overrule options in your karma.conf.js file.

### `karma.config` [`any`]

Default: `undefined`

Specify [karma configuration options](http://karma-runner.github.io/2.0/config/configuration-file.html) directly.
Options specified here will overrule any options in your karma.conf.js file.

## Non overridable options

The browser's life cycle is determined by `stryker-karma-runner`. I.e. these settings cannot be overridden:

```javascript
{
  browserNoActivityTimeout: 1000000,
  autoWatch: false,
  singleRun: false,
  detached: false
}
```

The `coverage` plugin will also be removed (not needed for mutation testing).

## Configure angular cli

**Note:** this requires v6.0.8 or higher of the [@angular/cli](https://www.npmjs.com/package/@angular/cli)

This is an example for a configuration of stryker using the angular cli:

```javascript
// stryker.conf.js
exports = function(config){
    config.set({
        // ...
        karma: {
            project: 'angular-cli',
            karma: {
                configFile: 'src/karma.conf.js'
            }
        }
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
