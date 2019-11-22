[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fstryker%2Fmaster%3Fmodule%3Dvue-mutator)](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/stryker/master?module=vue-mutator)
[![Build Status](https://github.com/stryker-mutator/stryker/workflows/CI/badge.svg)](https://github.com/stryker-mutator/stryker/actions?query=workflow%3ACI+branch%3Amaster)
[![NPM](https://img.shields.io/npm/dm/@stryker-mutator/vue-mutator.svg)](https://www.npmjs.com/package/@stryker-mutator/vue-mutator)
[![Node version](https://img.shields.io/node/v/@stryker-mutator/vue-mutator.svg)](https://img.shields.io/node/v/@stryker-mutator/vue-mutator.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker Vue mutator

A mutator that supports mutating `*.vue` code for [Stryker](https://stryker-mutator.io), the mutation testing framework for JavaScript and friends.

This plugin cannot work on its own as it requires additional mutators to function.

## Quickstart

First, install Stryker itself (you can follow the [quickstart on the website](https://stryker-mutator.io/quickstart.html))

Next, install this package:

```bash
npm install --save-dev @stryker-mutator/vue-mutator
```

Additionally: choose the mutator implementation for javascript, typescript or both.

```bash
npm install --save-dev @stryker-mutator/javascript-mutator
# AND / OR
npm install --save-dev @stryker-mutator/typescript
```

Now open up your stryker.conf.js file and add the following components:

```javascript
mutator: 'vue',
```

Finally, give it a go:

```bash
$ stryker run
```

## Additional required plugin

The `Vue Mutator` _by itself_ cannot mutate code. Instead it can parse `*.vue` files and choose a backing mutator based on the script type (either typescript or javascript). This is why the `Vue Mutator` requires `@stryker-mutator/javascript-mutator` and/or `@stryker-mutator/typescript` to work. This way it supports mutating single-file components with a `.vue` extension as well as regular code in `.js`, `.jsx`, `.ts` and `.tsx` files.

If you write TypeScript code please install this package:

```bash
npm install --save-dev @stryker-mutator/typescript
```

If you write JavaScript code please install this package:
```bash
npm install --save-dev @stryker-mutator/javascript-mutator
```

These plugins need no additional configuration to work with the `Vue Mutator`. Please leave the config setting in your stryker.conf.js file at `mutator: 'vue',`.

## Peer dependencies

You should make sure you have the correct versions of this plugin's dependencies installed:

* `vue-template-compiler`
* `@stryker-mutator/core`

For the current versions, see the `peerDependencies` section in the [package.json](https://github.com/stryker-mutator/stryker/blob/master/packages/vue-mutator/package.json).

These are marked as `peerDependencies` so you get a warning during installation when the correct versions are not installed.

The `vue-template-compiler` module absolutely requires the same version as your Vue dependency itself, which is why it is a peerDependency instead of a dependency.