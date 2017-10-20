[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/stryker-es6-mutator.svg)](https://www.npmjs.com/package/stryker-es6-mutator)
[![Node version](https://img.shields.io/node/v/stryker-es6-mutator.svg)](https://img.shields.io/node/v/stryker-es6-mutator.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![BCH compliance](https://bettercodehub.com/edge/badge/stryker-mutator/stryker)](https://bettercodehub.com/)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker ES6 mutator

A mutator that supports ES6 for [Stryker](https://stryker-mutator.github.io), the JavaScript Mutation testing framework. This plugin does not transpile any code. The code that the stryker-es6-mutator gets should be executable in your environment (i.e. the stryker-es6-mutator does not add support for Babel projects). 

## Quickstart

First, install Stryker itself (you can follow the [quickstart on the website](http://stryker-mutator.github.io/quickstart.html))

Next, install this package:

```bash
npm install --save-dev stryker-es6-mutator
```

Now open up your stryker.conf.js file and add the following components:

```javascript
mutator: 'es6',
```

Now give it a go:

```bash
$ stryker run
```

### ES6 Mutator

The `ES6 Mutator` is a plugin to mutate ES6 code. This is done using Babel without any plugins..

See [test code](https://github.com/stryker-mutator/stryker/tree/master/packages/stryker-es6-mutator/test/unit/mutator) to know which mutations are supported.