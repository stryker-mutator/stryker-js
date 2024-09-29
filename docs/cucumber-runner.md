---
title: Cucumber Runner
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/cucumber-runner.md
---

A plugin to use CucumberJS in StrykerJS

🥒 💖 👽

_Note: this plugin only supports the [`@cucumber/cucumber` nodejs test runner](https://github.com/cucumber/cucumber-js/blob/main/docs/cli.md#cli). If you're running cucumber with Jest or Karma, be sure to use those respective test runners instead._

## Install

Install @stryker-mutator/cucumber-runner locally within your project folder, like so:

```shell
npm i --save-dev @stryker-mutator/cucumber-runner
```

## Peer dependencies

The `@stryker-mutator/cucumber-runner` is a plugin for `stryker` to enable `@cucumber/cucumber` as a test runner.
As such, you should make sure you have the correct versions of its dependencies installed:

- `@cucumber/cucumber`
- `@stryker-mutator/core`

You can find the [`peerDependencies` in @stryker-mutator/cucumber-runner's package.json file](https://github.com/stryker-mutator/stryker-js/blob/HEAD/packages/cucumber-runner/package.json#L53-L56).

## Configuring

You can configure the cucumber test runner in the `stryker.config.json` (or `stryker.config.js`) file.

```json
{
  "testRunner": "cucumber",
  "cucumber": {
    "profile": "stryker",
    "features": ["my-features/my-feature.feature"],
    "tags": ["my-tag"]
  }
}
```

The cucumber runner supports loading [cucumber profiles](https://github.com/cucumber/cucumber-js/blob/main/docs/profiles.md#profiles) from your `cucumber.js` configuration file. The `default` profile will automatically be loaded if none was specified.

### `cucumber.profile` [`string`]

Default: `"default"`

Choose which profile to run. See [cucumber profiles](https://github.com/cucumber/cucumber-js/blob/main/docs/profiles.md#profiles)

### `cucumber.features` [`string[]`]

Default: `["features"]`

Choose which features to load. See [Running specific features](https://github.com/cucumber/cucumber-js/blob/main/docs/cli.md#running-specific-features).

### `cucumber.tags` [`string[]`]

Default: `undefined`

Choose which tags to focus. See [Tags](https://github.com/cucumber/cucumber-js/blob/main/docs/cli.md#tags).

## Coverage analysis

The `@stryker-mutator/cucumber-runner` plugin supports coverage analysis, test filtering and test location reporting. This means that `--coverageAnalysis perTest` (which is the default) is supported and will yield the best performance.

## Non-standard feature file locations

As of `@stryker-mutator/cucumber-runner` version 6.1, non-standard feature file locations are supported out of the box.

## TypeScript

If you're using ts-node to just-in-time transpile your TypeScript code with native ESM using a custom `--loader`, you will also need to add that to Stryker. For example, if you use this setup:

```json
{
  "scripts": {
    "test": "cross-env NODE_OPTIONS=\"--loader ts-node/esm\" cucumber-js",
    "test:mutation": "stryker run"
  }
}
```

You will also need to add the `--loader` to your 'stryker.config.json' file:

```json
{
  "testRunnerNodeArgs": ["--loader", "ts-node/esm"],
  "testRunner": "cucumber"
}
```
