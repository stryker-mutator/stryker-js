[![Build Status](https://travis-ci.org/stryker-mutator/stryker-jest-runner.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker-jest-runner)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker Plugin Seed
This project can be used as a blue print for writing plugins for [Stryker](http://stryker-mutator.github.io), the JavaScript mutation testing framework.

This project contains:

* An empty shell for all 5 kinds of plugins in Stryker
* An index file which registers the plugins using the Stryker way of plugin loading.
* A bootstrap for testing using [mocha](https://mochajs.org), [sinon](http://sinonjs.org/) and [chai](http://chaijs.com/)
* A correct list of dependencies to get you started with [TypeScript](http://typescriptlang.org/)
* A simple build system using [Grunt](http://gruntjs.com)
* A [vscode](https://code.visualstudio.com) configuration for easy running of the tests by hitting `f5`, inc debugging your typescript code.

**NOTE**: This seed is bootstrapped for the next major version of the stryker-api (0.3.0) using the tag `npm i stryker-api@next`
