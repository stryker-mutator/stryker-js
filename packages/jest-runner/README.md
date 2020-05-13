[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fstryker%2Fmaster%3Fmodule%3Djest-runner)](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/stryker/master?module=jest-runner)
[![Build Status](https://github.com/stryker-mutator/stryker/workflows/CI/badge.svg)](https://github.com/stryker-mutator/stryker/actions?query=workflow%3ACI+branch%3Amaster)
[![Slack Chat](https://img.shields.io/badge/slack-chat-brightgreen.svg?logo=slack)](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# @stryker-mutator/jest-runner

## Installation
Install @stryker-mutator/jest-runner locally within your project folder, like so:

```bash
npm i --save-dev @stryker-mutator/jest-runner
```

## Peer dependencies
The @stryker-mutator/jest-runner is a plugin for Stryker to enable Jest as a test runner. As such, you should make sure you have the correct versions of its dependencies installed:

- jest
- @stryker-mutator/core

For the minimum supported versions, see the peerDependencies section in package.json.

## Configuration
Make sure you set the `testRunner` option to "jest" and set `coverageAnalysis` to "off" in your Stryker configuration.

```javascript
{
    testRunner: 'jest',
    coverageAnalysis: 'off'
}
```

### Advanced configuration
The @stryker-mutator/jest-runner also provides a couple of configurable options using the `jest` property in your Stryker config:

```javascript
{
    jest: {
        projectType: 'custom',
        configFile: 'path/to/your/custom/jestConfig.js',
        config: {
            testEnvironment: 'jest-environment-jsdom-sixteen'
        },
        enableFindRelatedTests: true,
    }
}
```

| option | description | default value | alternative values |
|----|----|----|---|
| projectType (optional) | The type of project you are working on. | `custom` | `custom` uses the `config` option (see below)|
| | | | `create-react-app` when you are using [create-react-app](https://github.com/facebook/create-react-app) |
| | | | `create-react-app-ts` when you are using [create-react-app-typescript](https://github.com/wmonk/create-react-app-typescript) |
| configFile (optional) | The path to your Jest config file. | undefined | |
| config (optional) | Custom Jest config. This will override file-based config. | undefined | |
| enableFindRelatedTests (optional) | Whether to run jest with the `--findRelatedTests` flag. When `true`, Jest will only run tests related to the mutated file per test. (See [_--findRelatedTests_](https://jestjs.io/docs/en/cli.html#findrelatedtests-spaceseparatedlistofsourcefiles))  | true | false |

**Note:** When the projectType is `custom` and no `configFile` is specified, your `jest.config.js` or `package.json` will be loaded. \
**Note:** The `configFile` setting is **not** supported for `create-react-app` and `create-react-app-ts`. \
**Note:** Stryker currently only works for CRA-projects that have not been [_ejected_](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-run-eject).

The following is an example stryker.conf.js file:

```javascript
module.exports = {
  testRunner: "jest",
  mutator: "javascript",
  coverageAnalysis: "off",
  mutate: ["src/**/*.js"]
};
```

For more information on what these options mean, take a look at the [Stryker readme](https://github.com/stryker-mutator/stryker/blob/master/packages/core/README.md#available-options).

## Loading the plugin
In order to use the `@stryker-mutator/jest-runner` it must be loaded in the Stryker mutation testing framework via the Stryker configuration. The easiest way to achieve this, is not have a plugins section in your config file. That way, all node_modules starting with `@stryer-mutator/*` will be loaded.

## Contributing
Make sure to read the Stryker contribution guidelines located in the [Stryker mono repository](https://github.com/stryker-mutator/stryker/blob/master/CONTRIBUTING.md).
