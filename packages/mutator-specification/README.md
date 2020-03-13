[![NPM](https://img.shields.io/npm/dm/@stryker-mutator/mutator-specification.svg)](https://www.npmjs.com/package/@stryker-mutator/mutator-specification)
[![Node version](https://img.shields.io/node/v/@stryker-mutator/mutator-specification.svg)](https://img.shields.io/node/v/@stryker-mutator/mutator-specification.svg)
[![Slack Chat](https://img.shields.io/badge/slack-chat-brightgreen.svg?logo=slack)](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM)
![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker mutator specification

This package contains a specification for mutators for [Stryker](https://stryker-mutator.io) - The JavaScript mutation testing framework.

Stryker is language agnostic, examples of mutators are the [JavaScript mutator](https://github.com/stryker-mutator/stryker/tree/master/packages/javascript-mutator) and the [TypeScript mutator](https://github.com/stryker-mutator/stryker/tree/master/packages/typescript). However, they share a common set of mutators specified in this package. So this package defines a common set of specifications to which a mutator *could* conform.

The specifications are written as mocha tests, so it's easy to run them inside your own build as part of *insert your custom mutator here*. Please take a look at stryker-typescript or stryker-javascript-mutator if you want to know how.