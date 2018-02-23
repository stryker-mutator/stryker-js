[![Build Status](https://travis-ci.org/stryker-mutator/stryker.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker API
This is the repository for maintaining the API of the [Stryker](https://stryker-mutator.io) JavaScript mutation testing framework.
Plugin creators should depend on this API rather than on the main Stryker repository directly.

# Extension use cases
You can extend Stryker in a number of ways.

1. Create your own `Mutator`
2. Create a custom `Reporter`
3. Create a `TestFramework` for a test framework
4. Create a `TestRunner` to bridge the gap between your test runner and Stryker
5. Create a custom way of configuring Stryker by creating a `ConfigEditor` 

All extension points work in the same basic way. 

1. Create a `constructor function` (or `class`)
2. Register the `constructor function` to the correct `Factory`.

More info comming soon. In the mean time, take a look at the [Stryker homepage](https://stryker-mutator.io).
