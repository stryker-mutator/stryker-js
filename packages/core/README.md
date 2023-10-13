[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fstryker-js%2Fmaster%3Fmodule%3Dcore)](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/stryker-js/master?module=core)
[![Build Status](https://github.com/stryker-mutator/stryker-js/workflows/CI/badge.svg)](https://github.com/stryker-mutator/stryker-js/actions?query=workflow%3ACI+branch%3Amaster)
[![NPM](https://img.shields.io/npm/dm/@stryker-mutator/core.svg)](https://www.npmjs.com/package/@stryker-mutator/core)
[![Node version](https://img.shields.io/node/v/@stryker-mutator/core.svg)](https://img.shields.io/node/v/@stryker-mutator/core.svg)
[![Slack Chat](https://img.shields.io/badge/slack-chat-brightgreen.svg?logo=slack)](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM)

![StrykerJS](https://github.com/stryker-mutator/stryker-js/raw/master/stryker-80x80.png)

# StrykerJS
*Professor X: For someone who hates mutants... you certainly keep some strange company.*
*William Stryker: Oh, they serve their purpose... as long as they can be controlled.*

## Introduction
For an introduction to mutation testing and StrykerJS features, see [stryker-mutator.io](https://stryker-mutator.io/).

## Getting started

Please follow the [quickstart on the website](https://stryker-mutator.io/docs/stryker-js/getting-started/).

For small js projects, you can try the following command:

```
npm install --save-dev @stryker-mutator/core
# Only for small projects:
npx stryker run
```

It will run stryker with default values:

* Uses `npm test` as your test command
* Searches for files to mutate in the `lib` and `src` directories

## Usage

```sh
$ npx stryker <command> [options] [configFile]
```

See [usage on stryker-mutator.io](https://stryker-mutator.io/docs/stryker-js/usage)

## Supported mutators

See our website for the [list of currently supported mutators](https://stryker-mutator.io/docs/mutation-testing-elements/supported-mutators).

## Configuration

See [configuration on stryker-mutator.io](https://stryker-mutator.io/docs/stryker-js/configuration).

## Programmatic use

Stryker can also be used programmatically from nodejs. It exports 2 classes for you to use: `Stryker` and `StrykerCli`.

```ts
import { Stryker, StrykerCli } from '@stryker-mutator/core';
```

Both classes can be used to run Stryker. The main difference is that `Stryker` is a slightly more low-level approach, while `StrykerCli` is the straight up CLI api.

In this example you can see how to use both. 

```ts
async function main() {
  // Runs Stryker as if it was called directly from the cli. Not even returns a promise, it assumes to be allowed to call `process.exit`.
  new StrykerCli(process.argv /* RAW argv array */ ).run(); 

  // Runs Stryker, will not assume to be allowed to exit the process.
  const stryker = new Stryker({ concurrency: 4 } /* Partial Stryker options object */ );
  const mutantResults = await stryker.runMutationTest();
  // mutantResults or rejected with an error.
}
```

Stryker is written in TypeScript, so it is recommended to use Typescript as well to get the best developer experience.
