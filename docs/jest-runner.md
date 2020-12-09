---
title: Jest Runner
custom_edit_url: https://github.com/stryker-mutator/stryker/edit/master/docs/jest-runner.md
---

## Installation

Install @stryker-mutator/jest-runner locally within your project folder, like so:

```bash
npm i --save-dev @stryker-mutator/jest-runner
```

## Peer dependencies

The @stryker-mutator/jest-runner is a plugin for Stryker to enable Jest as a test runner. As such, you should make sure you have the correct versions of its dependencies installed:

- jest
- @stryker-mutator/core

For the minimum supported versions, see the peerDependencies section in the [package.json](https://raw.githubusercontent.com/stryker-mutator/stryker/master/packages/jest-runner/package.json).

## Configuration

Make sure you set the `testRunner` option to "jest" and set `coverageAnalysis` to "off" in your Stryker configuration.

```json
{
  "testRunner": "jest",
  "coverageAnalysis": "perTest"
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
    "enableBail": true,
    "enableFindRelatedTests": true
  }
}
```

### `jest.projectType` [`"string"`]

Default: `"custom"`

Configure where jest should get its configuration from.

* `"custom"`: use the [`jest.config` custom configuration](#jestconfig-object).
* `"create-react-app"`: use [react-scripts](https://www.npmjs.com/package/react-scripts), for projects created with [create-react-app](https://github.com/facebook/create-react-app).
* `"create-react-app-ts"`: **DEPRECATED** use [react-scripts-ts](https://www.npmjs.com/package/react-scripts-ts), for projects created with [create-react-app-typescript](https://github.com/wmonk/create-react-app-typescript). DEPRECATED, please [follow the migration guide](https://create-react-app.dev/docs/adding-typescript/) and move to `create-react-app`.

### `jest.configFile`] [`string`]

Default: `undefined`

The path to your Jest config file.

### `jest.config` [`object`]

Default: `undefined`

Custom Jest config. This will override file-based config.

### `jest.enableBail` [`boolean`]

Default: `true`

Whether to run jest with the `--bail` flag. When `true`, Jest stop testing after the first failing test, which boosts performance. (See [_--bail_](https://jestjs.io/docs/en/cli#--bail).

### `jest.enableFindRelatedTests` [`boolean`]

Default: `true`

Whether to run jest with the `--findRelatedTests` flag. When `true`, Jest will only run tests related to the mutated file per test. (See [_--findRelatedTests_](https://jestjs.io/docs/en/cli.html#--findrelatedtests-spaceseparatedlistofsourcefiles)).

