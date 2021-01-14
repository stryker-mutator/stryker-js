---
title: Jasmine Runner
custom_edit_url: https://github.com/stryker-mutator/stryker/edit/master/docs/jasmine-runner.md
---

A plugin to use Jasmine **as a test runner for node** in Stryker.

## Install

Install @stryker-mutator/jasmine-runner locally, like so:

```bash
npm i --save-dev @stryker-mutator/jasmine-runner
```

## Peer dependencies

The `@stryker-mutator/jasmine-runner` is a plugin for `stryker` to enable `jasmine` as a test runner.
As such, you should make sure you have the correct versions of its dependencies installed:

* `jasmine`
* `@stryker-mutator/core`


## Example

You can configure the jasmine test runner in the `stryker.conf.js` (or `stryker.conf.json`) file.

```json
{
  "coverageAnalysis": "perTest",
  "testRunner": "jasmine",
  "jasmineConfigFile": "spec/support/jasmine.json"
}
```

## Configuration

### `jasmineConfigFile` [`string`]

Default: `undefined`

Specify your [jasmine configuration file](https://jasmine.github.io/setup/nodejs.html#configuration) to be loaded.
Leaving this blank will result in the jasmine defaults, which are undocumented (see [source code here](https://github.com/jasmine/jasmine-npm/blob/master/lib/jasmine.js#L10-L38)).
