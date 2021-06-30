---
title: Cucumber Runner
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/cucumber-runner.md
---

A plugin to use CucumberJS in StrykerJS

🥒 💖 👽

## Install

Install @stryker-mutator/cucumber-runner locally within your project folder, like so:

```shell
npm i --save-dev @stryker-mutator/cucumber-runner
```

## Peer dependencies

The `@stryker-mutator/cucumber-runner` is a plugin for `stryker` to enable `@cucumber/cucumber` as a test runner.
As such, you should make sure you have the correct versions of its dependencies installed:

* `@cucumber/cucumber`
* `@stryker-mutator/core`

## Configuring

You can configure the cucumber test runner in the `stryker.conf.json` (or `stryker.conf.js`) file.

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

Your feature files might be located in a directory other than `features`. For example: `my-features`. In that case, you might have your default profile in cucumber.js config file defined as:

```js
module.exports = {
  default: 'my-features/**/*.feature'
}
```

And use this StrykerJS configuration

```json
{
  "testRunner": "cucumber"
}
```

This will work. Stryker will use your default profile and load any options you provide there. Unfortunately [this will remove this plugins ability to filter tests](https://github.com/cucumber/cucumber-js/issues/1712), meaning that pretty much all the tests are executed for each mutant.

A solution is to specify a _shadow profile_ and use that for Stryker:

```diff
module.exports = {
  default: 'my-features/**/*.feature',
+ stryker: ''
}
```

And use this StrykerJS configuration

```diff
{
  "testRunner": "cucumber",
+  "cucumber": {
+   "profile": "stryker",
+   "features": ["my-features/**/*.feature"]
+  }
}
```

This will make sure your feature files are run during the dry run and still allow the plugin to filter specific tests.
