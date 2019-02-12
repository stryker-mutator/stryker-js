
[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![NPM](https://img.shields.io/npm/dm/stryker-javascript-mutator.svg)](https://www.npmjs.com/package/stryker-javascript-mutator)
[![Node version](https://img.shields.io/node/v/stryker-javascript-mutator.svg)](https://img.shields.io/node/v/stryker-javascript-mutator.svg)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![BCH compliance](https://bettercodehub.com/edge/badge/stryker-mutator/stryker)](https://bettercodehub.com/)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker JavaScript mutator

A mutator that supports JavaScript for [Stryker](https://stryker-mutator.io), the JavaScript Mutation testing framework. This plugin does not transpile any code. The code that the stryker-javascript-mutator gets should be executable in your environment (i.e. the stryker-javascript-mutator does not add support for Babel projects). 

## Quickstart

First, install Stryker itself (you can follow the [quickstart on the website](https://stryker-mutator.io/quickstart.html))

Next, install this package:

```bash
npm install --save-dev stryker-javascript-mutator
```

Now open up your stryker.conf.js file and add the following components:

```javascript
mutator: 'javascript',
```

Now give it a go:

```bash
$ stryker run
```

### JavaScript Mutator

The `JavaScript Mutator` is a plugin to mutate JavaScript code. This is done using Babel without any plugins.

See [test code](https://github.com/stryker-mutator/stryker/tree/master/packages/stryker-javascript-mutator/test/unit/mutators) to know which mutations are supported.
