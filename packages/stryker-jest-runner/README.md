[![Build Status](https://travis-ci.org/stryker-mutator/stryker-jest-runner.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker-jest-runner)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker Jest Runner
A plugin to use the [Jest](http://facebook.github.io/jest/) test runner in [Stryker](http://stryker-mutator.github.io), the JavaScript mutation testing framework.

## Installation

Install stryker-jest-runner locally within your project folder, like so:

```bash
npm i --save-dev stryker-jest-runner
```

### Peer dependencies

The `stryker-jest-runner` is a plugin for Stryker to enable Jest as a test runner. 
As such, you should make sure you have the correct versions of its dependencies installed:

* `jest-cli`
* `jest-runtime`

For the minimum supported versions, see the `peerDependencies` section in [package.json](https://github.com/stryker-mutator/stryker-jest-runner/blob/master/package.json).
For all supported version, see the `env` section in [.travis.yml](https://github.com/stryker-mutator/stryker-jest-runner/blob/master/.travis.yml).

## Configuring

For the time being, the Jest runner uses a default configuration.
But pull requests are - obviously - welcome. 

### Loading the plugin

In order to use the `stryker-jest-runner` it must be loaded in the Stryker mutation testing framework via the Stryker configuration. 
The easiest way to achieve this, is *not have a `plugins` section* in your config file. That way, all `node_modules` starting with `stryker-` will be loaded.

### Using the test runner

In order to use Jest as the test runner, you simply specify it in your config file: `testRunner: 'jest'`.
Note that coverageAnalysis is not yet supported, so you must explicitly set it to `off` in your Stryker configration.
Again, pull requests are - obviously - welcome.

## Contributing

Before you start hacking along, make sure to install a supported version of Jest inside your working copy.
The versions supported are listed above.