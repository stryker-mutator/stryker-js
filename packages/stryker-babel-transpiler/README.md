[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/stryker-babel-transpiler.svg)](https://www.npmjs.com/package/stryker-babel-transpiler)
[![Node version](https://img.shields.io/node/v/stryker-babel-transpiler.svg)](https://img.shields.io/node/v/stryker-babel-transpiler.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![BCH compliance](https://bettercodehub.com/edge/badge/stryker-mutator/stryker)](https://bettercodehub.com/)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker Babel plugin

A plugin that adds support for [Babel](https://github.com/babel/babel) to [Stryker](https://stryker-mutator.io), the JavaScript Mutation testing framework. 

## Quickstart

First, install Stryker itself (you can follow the [quickstart on the website](https://stryker-mutator.io/quickstart.html))

Next, install this package:

```bash
npm install --save-dev stryker-babel-transpiler
```

Next, open up your `stryker.conf.js` file and add the following properties:
```javascript
babelrcFile: '.babelrc', // Location of your .babelrc file
transpilers: [
    'babel' // Specify that your code needs to be transpiled before tests can be run
],
// If you don't have a .babelrc file you can specify the config directly (Not recommended!):
// babelConfig: { "presets": ["env"],  "plugins": ["transform-object-rest-spread"] },
```
if you initialize stryker using `stryker init`, the babelrcFile property will be added to your `stryker.conf.js` automatically.

Now give it a go: 
```bash
$ stryker run
```

## Peer dependencies
The `stryker-babel-transpiler` plugin requires the following packages to be installed in order to work: 
* `stryker-api`
* `babel-core`

For the current versions, see the `peerDependencies` section in the package.json file.

These are marked as `peerDependencies` so you get a warning during installation when the correct versions are not installed.
