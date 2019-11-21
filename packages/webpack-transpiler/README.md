[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fstryker%2Fmaster%3Fmodule%3Dwebpack-transpiler)](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/stryker/master?module=webpack-transpiler)
[![Build Status](https://github.com/stryker-mutator/stryker/workflows/CI/badge.svg)](https://github.com/stryker-mutator/stryker/actions?query=workflow%3ACI+branch%3Amaster)
[![NPM](https://img.shields.io/npm/dm/@stryker-mutator/webpack-transpiler.svg)](https://www.npmjs.com/package/@stryker-mutator/webpack-transpiler)
[![Node version](https://img.shields.io/node/v/@stryker-mutator/webpack-transpiler.svg)](https://img.shields.io/node/v/@stryker-mutator/webpack-transpiler.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# Stryker Webpack Transpiler

A plugin to support [Webpack](http://webpack.js.org/) bundling as a transpiler in [Stryker](https://stryker-mutator.io), the JavaScript Mutation testing framework.

## Quick start

First, install Stryker itself (you can follow the [quickstart on the website](https://stryker-mutator.io/quickstart.html))

Next, install this package:

```bash
npm install --save-dev @stryker-mutator/webpack-transpiler
```

Open up your `stryker.conf.js` file and add the following properties:

```javascript
webpack: {
    configFile: 'webpack.config.js', // Location of your webpack config file
    silent: true // Specify to remove the "ProgressPlugin" from your webpack config file (making the process silent)
},
transpilers: [
    'webpack' // Specify that your code needs to be transpiled before tests can be run
],
```

**Note:** if the webpack config is absent from your stryker configuration, the above values are used by default.

If you initialize stryker using `stryker init`, the webpack property will be added to your `stryker.conf.js` automatically.

Now give it a go:

```bash
$ stryker run
```

## Peer dependencies
The `@stryker-mutator/webpack-transpiler` plugin requires the following packages to be installed in order to work:

* `@stryker-mutator/core`
* `webpack`

For the current supported versions, see the `peerDependencies` section in the [package.json](https://github.com/stryker-mutator/stryker/tree/master/packages/webpack-transpiler/package.json) file.