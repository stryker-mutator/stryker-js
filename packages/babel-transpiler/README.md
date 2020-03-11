[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fstryker%2Fmaster%3Fmodule%3Dbabel-transpiler)](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/stryker/master?module=babel-transpiler)
[![Build Status](https://github.com/stryker-mutator/stryker/workflows/CI/badge.svg)](https://github.com/stryker-mutator/stryker/actions?query=workflow%3ACI+branch%3Amaster)
[![NPM](https://img.shields.io/npm/dm/@stryker-mutator/babel-transpiler.svg)](https://www.npmjs.com/package/@stryker-mutator/babel-transpiler)
[![Node version](https://img.shields.io/node/v/@stryker-mutator/babel-transpiler.svg)](https://img.shields.io/node/v/@stryker-mutator/babel-transpiler.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker Babel plugin

A plugin that adds support for [Babel](https://github.com/babel/babel) to [Stryker](https://stryker-mutator.io), the JavaScript Mutation testing framework.

## Peer dependencies

The `@stryker-mutator/babel-transpiler` requires you to install babel 7. Install _at least_ the `@babel/core` package (version 7).

## Quickstart

First, install Stryker itself (you can follow the [quickstart on the website](https://stryker-mutator.io/quickstart.html))

Next, install this package:

```bash
npm install --save-dev @stryker-mutator/babel-transpiler @babel/core
```

Next, open up your `stryker.conf.js` (or `stryker.conf.json`) file and add the following properties:

```javascript
babel: {
    // Location of your .babelrc file, set to `null` to
    optionsFile: '.babelrc',
    // Override options here:
    options: {
        // presets: ['@babel/env'],
        // plugins: ['transform-es2015-spread']
    },
     // Add extensions here
    extensions: [/*'.ts'*/]
}
transpilers: [
    'babel' // Enable the babel transpiler
],
```

If you initialize stryker using `stryker init`, the babelrcFile property will be added to your `stryker.conf.js` automatically.

Now give it a go:

```bash
$ npx stryker run
```

## Configuration

### `babel.optionsFile` [`string | null`]

Default: `'.babelrc'`

The location of your babelrc file. Set this value to `null` to disable loading of a babel config file.

### `babel.options` [`TranspilerOptions`]

Default: `{}`

Override babel options from your config file here. Please see [babel's documentation](https://babeljs.io/docs/en/options) to see what is available.

Some options are restricted to be set, because the @stryker-mutator/babel-transpiler takes control of it. These options are: `filename`, `filenameRelative` and `cwd`.

### `babel.extensions` [`string[]`]

Default: `[]`

Load additional extensions here. By default only these extensions get picked up by babel: `".js", ".jsx", ".es6", ".es", ".mjs"`.
For example: if you want to enable typescript transpilation, set extensions to `["ts", "tsx"]`.

