[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![Mutation testing badge](https://badge.stryker-mutator.io/github.com/stryker-mutator/stryker-jest-runner/master)](https://stryker-mutator.github.io)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker-jest-runner

## Installation
Install stryker-jest-runner locally within your project folder, like so:

```bash
npm i --save-dev stryker-jest-runner
```

## Peer dependencies
The stryker-jest-runner is a plugin for Stryker to enable Jest as a test runner. As such, you should make sure you have the correct versions of its dependencies installed:

- jest
- stryker-api

For the minimum supported versions, see the peerDependencies section in package.json.

## Configuration

### Configuring Stryker
Make sure you set the `testRunner` option to "jest" and set `coverageAnalysis` to "off" in your Stryker configuration.

```javascript
{
    testRunner: 'jest'
    coverageAnalysis: 'off'
}
```

### Configuring Jest
The stryker-jest-runner also provides a couple of configurable options using the `jest` property in your Stryker config:

```javascript
{
    jest: {
        project: 'default',
        config: require('path/to/your/custom/jestConfig.js')
    }
}
```

| option | description | default value | alternative values |
|----|----|----|---|
| project (optional) | The type of project you are working on. | `default` | `default` uses the `config` option (see below)|
| | | | `react` when you are using [create-react-app](https://github.com/facebook/create-react-app) |
| | | | `react-ts` when you are using [create-react-app-typescript](https://github.com/wmonk/create-react-app-typescript) |
| config (optional) | A custom Jest configuration object. You could also use `require` to load it here) | undefined | |

**Note:** When neither of the options are specified it will use the Jest configuration in your "package.json". \
**Note:** the `project` option is ignored when the `config` option is specified.
**Note:** Stryker currently only works for CRA-projects that have not been [_ejected_](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-run-eject).

The following is an example stryker.conf.js file:

```javascript
module.exports = function(config) {
  config.set({
    testRunner: "jest",
    mutator: "javascript",
    coverageAnalysis: "off",
    mutate: ["src/**/*.js"]
  });
};
```

For more information on what these options mean, take a look at the [Stryker readme](https://github.com/stryker-mutator/stryker/tree/master/packages/stryker#readme).

## Loading the plugin
In order to use the `stryker-jest-runner` it must be loaded in the Stryker mutation testing framework via the Stryker configuration. The easiest way to achieve this, is not have a plugins section in your config file. That way, all node_modules starting with `stryker-` will be loaded.

## Contributing
Make sure to read the Stryker contribution guidelines located in the [Stryker mono repository](https://github.com/stryker-mutator/stryker/blob/master/CONTRIBUTING.md).
