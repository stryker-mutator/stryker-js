---
title: Jest Runner
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/jest-runner.md
---

## Installation

Install @stryker-mutator/jest-runner locally within your project folder, like so:

```bash
npm i --save-dev @stryker-mutator/jest-runner
# OR
yarn add --dev @stryker-mutator/jest-runner
```

## Peer dependencies

The @stryker-mutator/jest-runner is a plugin for Stryker to enable Jest as a test runner. As such, you should make sure you have the correct versions of its dependencies installed:

- jest
- @stryker-mutator/core

For the minimum supported versions, see the peerDependencies section in the [package.json](https://raw.githubusercontent.com/stryker-mutator/stryker/master/packages/jest-runner/package.json).

## Configuration

Make sure you set the `testRunner` option to "jest".

```json
{
  "testRunner": "jest"
}
```

The @stryker-mutator/jest-runner also provides a couple of configurable options using the `jest` property in your Stryker config:

```json
{
  "jest": {
    "projectType": "custom",
    "configFile": "path/to/your/custom/jestConfig.js",
    "config": {
      "testEnvironment": "jest-environment-jsdom-sixteen"
    },
    "enableFindRelatedTests": true
  }
}
```

### `jest.projectType` [`"string"`]

Default: `"custom"`

Configure where jest should get its configuration from.

- `"custom"`: use the [`jest.config` custom configuration](#jestconfig-object).
- `"create-react-app"`: use [react-scripts](https://www.npmjs.com/package/react-scripts), for projects created with [create-react-app](https://github.com/facebook/create-react-app).
- `"create-react-app-ts"`: **DEPRECATED** use [react-scripts-ts](https://www.npmjs.com/package/react-scripts-ts), for projects created with [create-react-app-typescript](https://github.com/wmonk/create-react-app-typescript). DEPRECATED, please [follow the migration guide](https://create-react-app.dev/docs/adding-typescript/) and move to `create-react-app`.

### `jest.configFile` [`string`]

Default: `undefined`

The path to your Jest config file of package.json file containing in the `"jest"` key. By default, the @stryker-mutator/jest-runner will try to look for "jest.conf.js" or "package.json" in the current working directory.

### `jest.config` [`object`]

Default: `undefined`

Custom Jest config. This will override file-based config.

### `jest.enableFindRelatedTests` [`boolean`]

Default: `true`

Whether to run jest with the `--findRelatedTests` flag. When `true`, Jest will only run tests related to the mutated file per test. (See [_--findRelatedTests_](https://jestjs.io/docs/en/cli.html#--findrelatedtests-spaceseparatedlistofsourcefiles)).

## ECMAScript Modules

Jest ships with [support for ECMAScript Modules (ESM)](https://jestjs.io/docs/ecmascript-modules). In order to provide the `--experimental-vm-modules` node option, you will need to add this to your stryker.conf.json file:

```json
{
  "testRunnerNodeArgs": ["--experimental-vm-modules"]
}
```

## Coverage analysis

The `@stryker-mutator/jest-runner` plugin supports coverage analysis and test filtering, meaning you can run with `--coverageAnalysis perTest` for optimal performance.

### Coverage reporting

When using `"all"` or `"perTest"` coverage analysis, this plugin reports mutant coverage by hooking into the [jest's test environment](https://jestjs.io/docs/en/configuration.html#testenvironment-string). The test environment setting in your configuration file is overridden by default and you won't have to do anything here.

However, if you choose to override the jest-environment on a file-by-file basis using [jest's `@jest-environment` docblock](https://jestjs.io/docs/en/configuration.html#testenvironment-string), you will have to do the work.

This:

```js
/**
 * @jest-environment jsdom
 */
```

Becomes:

```js
/**
 * @jest-environment @stryker-mutator/jest-runner/jest-env/jsdom
 */
```

This is the list of jest environments that are shipped with @stryker-mutator/jest-runner.

| Jest test environment          | @stryker-mutator/jest-runner override              |
| ------------------------------ | -------------------------------------------------- |
| node                           | @stryker-mutator/jest-runner/jest-env/node         |
| jsdom                          | @stryker-mutator/jest-runner/jest-env/jsdom         |
| jest-environment-jsdom-sixteen | @stryker-mutator/jest-runner/jest-env/jsdom-sixteen |

Don't worry; using Stryker's alternative is harmless during regular unit testing.

If you're using a custom test environment, you'll need to mixin the Stryker functionality yourself:

```js
// my-custom-jest-environment.js
const { mixinJestEnvironment } = require('@stryker-mutator/jest-runner');
const NodeEnvironment = require('jest-environment-node');

class MyCustomTestEnvironment extends NodeEnvironment {
  // custom magic here ✨
}

module.exports = mixinJestEnvironment(MyCustomTestEnvironment);
```

### Test filtering

When using `"perTest"` coverage analysis, the `@stryker-mutator/jest-runner` will hook into the [jest test runner](https://jestjs.io/docs/en/configuration.html#testrunner-string). Both `"jasmine2"` as well as [`jest-circus`](https://www.npmjs.com/package/jest-circus) (default) are supported here.

If you're using a different test runner, you're out of luck. Please downgrade to using `"all"` coverage analysis. If you think we should support your test runner, please let us know by opening an [issue](https://github.com/stryker-mutator/stryker-js/issues/new?assignees=&labels=%F0%9F%9A%80+Feature+request&template=feature_request.md&title=), or by joining our [slack channel](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM).
