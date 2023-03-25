---
title: Karma Runner
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/karma-runner.md
---

## Installation

A plugin to use the karma test runner (or [@angular/cli](https://www.npmjs.com/package/@angular/cli)'s `ng test`) in Stryker.

## Install

Install @stryker-mutator/karma-runner locally within your project folder, like so:

```bash
npm i --save-dev @stryker-mutator/karma-runner
```

## Bring your own test runner

The `@stryker-mutator/karma-runner` is a plugin for `stryker` to enable `karma` as a test runner.
However, it does *not* come packaged with it's own version of `karma`, instead it
uses *your very own karma* version. It can also work with `@angular/cli`, see [Configuring](#configuring)

**Note:** karma v2.0.3 has a [known issue](https://github.com/karma-runner/karma/issues/3057) which makes it impossible to use it with Stryker. please upgrade to 2.0.4 or higher.

## Configuring

You can configure the `@stryker-mutator/karma-runner` using the `stryker.conf.js` (or `stryker.conf.json`) config file.

```json
{
  "testRunner": "karma",
  "karma": {
    "projectType": "custom",
    "configFile": "path/to/karma.conf.js",
    "config": {
      "browsers": ["ChromeHeadless"]
    }
  }
}
```

### `karma.projectType` [`"custom"` | `"angular-cli"`]

Default: `"custom"`

Specify which kind of project you're using. This determines which command is used to start karma

* **`"custom"`**: configure @stryker-mutator/karma-runner to use `karma start`.
* **`"angular-cli"`**: configure @stryker-mutator/karma-runner to use `ng test` (see [configuring for angular-cli](#configure-angular-cli)).

### `karma.configFile` [`string`]

Default: `undefined`

Specify a ['karma.conf.js' file](http://karma-runner.github.io/2.0/config/configuration-file.html) to be loaded.
Options specified directly in your stryker.conf.js file using `karma.config` will overrule options in your karma.conf.js file.

### `karma.config` [`object`]

Default: `undefined`

Specify [karma configuration options](http://karma-runner.github.io/2.0/config/configuration-file.html) directly.
Options specified here will overrule any options in your karma.conf.js file.

### `karma.ngConfig.testArguments` [`object`]

Default: `undefined`

Add [ng test arguments](https://github.com/angular/angular-cli/wiki/test#options). For example, specify an alternative project with:

```json
{
  "karma": {
    "projectType": "angular-cli",
      "ngConfig": {
        "testArguments": {
          "project": "my-lib"
        }
    }
  }
}
```

This will run ng test with `--project` argument: `ng test --project=my-lib`.

## Non overridable options

The browser's life cycle is determined by `@stryker-mutator/karma-runner`. I.e. these settings cannot be overridden. You configuration settings for these will be ignored.

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

Please follow the [angular guide](./guides/angular.md).

## Debugging

As Stryker runs karma in its own process, its logging output will be consumed by Stryker.

To see all logging from karma, set the log level to `trace` in `stryker.conf.json`.

```json
{
  "logLevel": "trace"
}
```
