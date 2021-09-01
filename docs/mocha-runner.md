---
title: Mocha Runner
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/mocha-runner.md
---

A plugin to use Mocha in Stryker

## Install

Install @stryker-mutator/mocha-runner locally within your project folder, like so:

```shell
npm i --save-dev @stryker-mutator/mocha-runner
```

## Peer dependencies

The `@stryker-mutator/mocha-runner` is a plugin for `stryker` to enable `mocha` as a test runner.
As such, you should make sure you have the correct versions of its dependencies installed:

* `mocha`
* `@stryker-mutator/core`

## Configuring

You can configure the mocha test runner in the `stryker.conf.json` (or `stryker.conf.js`) file.

```json
{
  "testRunner": "mocha",
  "coverageAnalysis": "perTest",
  "mochaOptions": {
    "spec": [ "test/**/*.js" ],
    "config": "path/to/mocha/config/.mocharc.json",
    "package": "path/to/custom/package/package.json",
    "opts": "path/to/custom/mocha.opts",
    "ui": "bdd",
    "require": [ "babel-register" ],
    "async-only": false,
    "grep": ".*"
  }
}
```

When using Mocha version 6, @stryker-mutator/mocha-runner will use [mocha's internal file loading mechanism](https://mochajs.org/api/module-lib_cli_options.html#.loadOptions) to load your mocha configuration.
So feel free to _leave out the mochaOptions entirely_ if you're using one of the [default file locations](https://mochajs.org/#configuring-mocha-nodejs).

Alternatively, use `['no-config']: true`, `['no-package']: true` or `['no-opts']: true` to ignore the default mocha config, default mocha package.json and default mocha opts locations respectively.

### `mochaOptions.spec` [`string` or `string[]`]

Default: `"test/**/*.js"`

Choose which files to include. This is comparable to [mocha's test directory](https://mochajs.org/#the-test-directory) although there is no support for `--recursive`.

If you want to load all files recursively: use a globbing expression (`'test/**/*.js'`). If you want to decide on the order of files, use multiple globbing expressions. For example: use `['test/helpers/**/*.js', 'test/unit/**/*.js']` if you want to make sure your helpers are loaded before your unit tests.

### `mochaOptions.config` [`string` | `undefined`]

Default: `undefined`

Explicit path to the [mocha config file](https://mochajs.org/#-config-path)

*New since Mocha 6*

### `mochaOptions.package` [`string` | `undefined`]

Default: `undefined`

Specify an explicit path to a package.json file (ostensibly containing configuration in a mocha property).
See https://mochajs.org/#-package-path.

*New since Mocha 6*

### `mochaOptions.opts` [`string` | false]

Default: `"test/mocha.opts"`

Specify a ['mocha.opts' file](https://mochajs.org/#mochaopts) to be loaded. Options specified directly in your stryker.conf.js file will overrule options from the 'mocha.opts' file. Disable loading of an additional mocha.opts file with `false`.

The only supported mocha options are used: `--ui`, `--require`, `--async-only`, `--timeout`, `--grep` (or their short form counterparts). Others are ignored by the @stryker-mutator/mocha-runner.

### `mochaOptions.grep` [`RegExp`]

Default: `undefined`

Specify a mocha [`grep`](https://mochajs.org/#grep) command, to single out individual tests.

### `mochaOptions.ui` [`string`]

Default: `undefined`

Set the name of your [mocha ui](https://mochajs.org/#-u---ui-name)

### `mochaOptions.extension` [`string`]

Default: `undefined`

Set mocha's [--extension](https://mochajs.org/#-extension-ext) property.

### `mochaOptions.require` [`string[]`]

Default: `[]`

Set mocha's [`require` option](https://mochajs.org/#-r---require-module-name)

_Note:_ if you want to require [`esm`](https://www.npmjs.com/package/esm), you will need to use `"testRunnerNodeArgs": ["--require", "esm"]` instead. See [#3014](https://github.com/stryker-mutator/stryker-js/issues/3014) for more information.

### `mochaOptions.async-only` [`boolean`]

Default: `false`

Set mocha's [`asyncOnly` option](https://mochajs.org/#usage)

### `mochaOptions.timeout` [`number`]

Default: `undefined`

Set mocha's [`timeout` option](https://mochajs.org/#-t---timeout-ms)
