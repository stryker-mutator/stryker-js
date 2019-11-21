[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fstryker%2Fmaster%3Fmodule%3Dwct-runner)](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/stryker/chore/run-stryker-in-ci?module=wct-runner)
[![Build Status](https://github.com/stryker-mutator/stryker/workflows/CI/badge.svg)](https://github.com/stryker-mutator/stryker/actions?query=workflow%3ACI+branch%3Amaster)
[![NPM](https://img.shields.io/npm/dm/@stryker-mutator/wct-runner.svg)](https://www.npmjs.com/package/@stryker-mutator/wct-runner)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker WCT runner

## Installation

Install @stryker-mutator/wct-runner locally within your project folder, like so:

```bash
npm i --save-dev @stryker-mutator/wct-runner
```

## Peer dependencies

The @stryker-mutator/wct-runner is a plugin to enable the Web Component Tester (wct) as a test runner for Stryker. As such, you should make sure you have the correct versions of its dependencies installed:

- web-component-tester
- @stryker-mutator/core

For the minimum supported versions, see the [peerDependencies section in package.json](https://github.com/stryker-mutator/stryker/blob/master/packages/wct-runner/package.json#L34).

_Note for Polymer users_: if you're using a global installation of [polymer-cli](https://www.npmjs.com/package/polymer-cli) to run your tests, you will need to install [web-component-tester](https://www.npmjs.com/package/web-component-tester) locally, right next to the @stryker-mutator/wct-runner package. The @stryker-mutator/wct-runner will not be able to find your global installation of the polymer-cli. You can use this command: `npm i -D web-component-tester`.

## Configuration

### Configuring Stryker

Make sure you set the `testRunner` option to "wct" and set `coverageAnalysis` to "off" in your Stryker configuration.

```javascript
{
    testRunner: 'wct'
    coverageAnalysis: 'off', // coverage analysis is not supported yet for the @stryker-mutator/wct-runner.
    maxConcurrentTestRunners: 4, // A maximum of half your CPU's is recommended
    timeoutMS: 10000 // A higher timeout is recommended to allow for browser startup
}
```

For more information on what these options mean, take a look at the [Stryker readme](https://github.com/stryker-mutator/stryker/tree/master/packages/stryker#readme).

### Configuring WCT

The @stryker-mutator/wct-runner will honor your regular wct configuration. This means that it will automatically load the wct.conf.json file from the current working directory as expected. You can change this to a different file using the `wct.configFile` property in your Stryker config:

```js
// Override config file example
wct: {
    configFile: 'config/wct.conf.json'
}
```

It is also possible to override other wct properties specific for stryker. Full example:

```js
// Full example
wct: {
    configFile: 'alternative/wct/configuration.json',
    verbose: true,
    npm: true,
    plugins: {
        local: {
            browsers: ["chrome"],
            skipSeleniumInstall: true,
            browserOptions: {
                chrome: ["window-size=1920,1080", "headless", "disable-gpu"],
                firefox: ["--headless"]
            }
        }
    }
}
```

### `wct.verbose` [`boolean`]

Default: `false`

Enable/disable verbose WCT logging. WCT can be noisy. By default, Stryker will swallow any wct log messages. Enabling this option will forward any wct log messages to Stryker logging. Don't forget to set `logLevel` (or `fileLogLevel`) to `'debug'` in your Stryker configuration to get the most logging out of WCT.

### `wct.npm` [`boolean`]

Default: `false`

Use WCT with the `--npm` flag. This will allow web-components installed via npm, instead of bower.

### `wct.plugins.local.browserOptions`

Default: `undefined`

It is recommended to configure a headless browser when using WCT in combination with Stryker. An example configuration:

```js
wct: {
    plugins: {
        local: {
          browserOptions: {
                chrome: ["window-size=1920,1080", "headless", "disable-gpu"],
                firefox: ["--headless"]
            }
        }
    }
}
```

### Other wct options

For more information about the available wct options, please see [wct's config.ts file](https://github.com/Polymer/tools/blob/master/packages/web-component-tester/runner/config.ts#L36).


## Loading the plugin

In order to use the `@stryker-mutator/wct-runner` it must be loaded in the Stryker mutation testing framework via the Stryker configuration. The easiest way to achieve this, is not have a plugins section in your config file. That way, all node_modules starting with `stryker-` will be loaded.

## Contributing

Make sure to read the Stryker contribution guidelines located in the [Stryker mono repository](https://github.com/stryker-mutator/stryker/blob/master/CONTRIBUTING.md).
