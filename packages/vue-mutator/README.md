[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/stryker-vue-mutator.svg)](https://www.npmjs.com/package/stryker-vue-mutator)
[![Node version](https://img.shields.io/node/v/stryker-vue-mutator.svg)](https://img.shields.io/node/v/stryker-vue-mutator.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![BCH compliance](https://bettercodehub.com/edge/badge/stryker-mutator/stryker)](https://bettercodehub.com/)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker Vue mutator

A mutator that supports mutating `*.vue` code for [Stryker](https://stryker-mutator.io), the mutation testing framework for JavaScript and friends.

This plugin cannot work on its own as it requires additional mutators to function.

## Quickstart

First, install Stryker itself (you can follow the [quickstart on the website](https://stryker-mutator.io/quickstart.html))

Next, install this package:

```bash
npm install --save-dev stryker-vue-mutator
```

Additionally: choose the mutator implementation for javascript, typescript or both.

```bash
npm install --save-dev stryker-javascript-mutator
# AND / OR
npm install --save-dev stryker-typescript
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

The `Vue Mutator` _by itself_ cannot mutate code. Instead it can parse `*.vue` files and choose a backing mutator based on the script type (either typescript or javascript). This is why the `Vue Mutator` requires `stryker-javascript-mutator` and/or `stryker-typescript` to work. This way it supports mutating single-file components with a `.vue` extension as well as regular code in `.js`, `.jsx`, `.ts` and `.tsx` files.

If you write TypeScript code please install this package:

```bash
npm install --save-dev stryker-typescript
```

If you write JavaScript code please install this package:
```bash
npm install --save-dev stryker-javascript-mutator
```

These plugins need no additional configuration to work with the `Vue Mutator`. Please leave the config setting in your stryker.conf.js file at `mutator: 'vue',`.

## Peer dependencies

You should make sure you have the correct versions of this plugin's dependencies installed:

* `vue-template-compiler`
* `stryker-api`

For the current versions, see the `peerDependencies` section in the [package.json](https://github.com/stryker-mutator/stryker/blob/master/packages/stryker-vue-mutator/package.json).

These are marked as `peerDependencies` so you get a warning during installation when the correct versions are not installed.

The `vue-template-compiler` module absolutely requires the same version as your Vue dependency itself, which is why it is a peerDependency instead of a dependency.