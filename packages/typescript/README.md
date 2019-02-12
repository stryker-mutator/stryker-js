[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/@stryker-mutator/typescript.svg)](https://www.npmjs.com/package/@stryker-mutator/typescript)
[![Node version](https://img.shields.io/node/v/@stryker-mutator/typescript.svg)](https://img.shields.io/node/v/@stryker-mutator/typescript.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![BCH compliance](https://bettercodehub.com/edge/badge/stryker-mutator/stryker)](https://bettercodehub.com/)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker Typescript

A collection of plugins for native TypeScript support in [Stryker](https://stryker-mutator.io), the ~~JavaScript~~ *TypeScript* Mutation testing framework.

## Quickstart

First, install Stryker itself (you can follow the [quickstart on the website](https://stryker-mutator.io/quickstart.html))

Next, install this package:

```bash
npm install --save-dev @stryker-mutator/typescript
```

Now open up your stryker.conf.js file and add the following components:

```javascript
coverageAnalysis: 'off', // Coverage analysis with a transpiler is not supported a.t.m.
tsconfigFile: 'tsconfig.json', // Location of your tsconfig.json file
mutator: 'typescript', // Specify that you want to mutate typescript code
transpilers: [
    'typescript' // Specify that your typescript code needs to be transpiled before tests can be run. Not needed if you're using ts-node Just-in-time compilation.
]
```

Now give it a go:

```bash
$ stryker run
```

## Peer dependencies

The `@stryker-mutator/typescript` package is collection a plugins for `stryker` to enable `typescript` support. As such, you should make sure you have the correct versions of its dependencies installed:

* `typescript`
* `@stryker-mutator/core`

For the current versions, see the `peerDependencies` section in the [package.json](https://github.com/stryker-mutator/stryker/blob/master/packages/typescript/package.json).

These are marked as `peerDependencies` so you get a warning during installation when the correct versions are not installed.

## Load the plugins

In order to use one of the `@stryker-mutator/typescript`'s plugins it must be loaded into Stryker. 
The easiest way to achieve this, is *not have a `plugins` section* in your config file. That way, all `node_modules` starting with `stryker-` will be loaded.

If you do decide to choose specific modules, don't forget to add `'@stryker-mutator/typescript'` to the list of plugins to load.

## 3 Plugins

This package contains 3 plugins to support TypeScript

1. [TypescriptConfigEditor](#typescriptconfigeditor)
1. [TypescriptMutator](#typescriptmutator)
1. [TypescriptTranspiler](#typescripttranspiler)

### TypescriptConfigEditor

The `TypescriptConfigEditor` is a handy plugin that reads **your** tsconfig.json file and loads it into stryker.conf.js. It will capture all your tsconfig settings to the `tsconfig` in stryker (this property is later used by the `TypescriptMutator` and the `TypescriptTranspiler`)

Enable the config editor by pointing the `tsconfigFile` property to your tsconfig location:

```javascript
// stryker.conf.js
{
 tsconfigFile: 'tsconfig.json',
}
``` 

We always override some properties to enforce these rules (see [issue 391](https://github.com/stryker-mutator/stryker/issues/391) to find out why):

```js
allowUnreachableCode: true
noUnusedLocals: false
noUnusedParameters: false
```

### TypescriptMutator

The `TypescriptMutator` is a plugin to mutate typescript code. It builds a Typescript [Abstract Syntax Tree (AST)](https://en.wikipedia.org/wiki/Abstract_syntax_tree) and mutates your code using different kind of mutators.

See [test code](https://github.com/stryker-mutator/stryker/tree/master/packages/typescript/test/unit/mutator) to know which mutations are supported.

Configure the Typescript mutator in your stryker.conf.js file:

```javascript
// stryker.conf.js
{
    mutator: 'typescript'
}
```

### TypescriptTranspiler

The `TypescriptTranspiler` is a plugin to transpile typescript source code before running tests. If you're using a bundler you might want to configure that instead. 

Given your Typescript configuration (see **TypescriptConfigEditor**) it generates the javascript output. This is also used to transpile each mutant to javascript. Internally, it uses the same method as Typescript's watch mode (`tsc -w`), so it can transpile mutants fairly efficiently.

Configure the Typescript transpiler in your stryker.conf.js file:

```javascript
// stryker.conf.js
{
    transpilers: [
        'typescript'
        // You can specify more transpilers if needed
    ]
}
```
