---
title: Vitest Runner
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/vitest-runner.md
---

## Installation

A plugin to use the [vitest](https://vitest.dev/) test runner in Stryker.

## Install

Install `@stryker-mutator/vitest-runner locally within your project folder, like so:

```bash
npm i --save-dev @stryker-mutator/vitest-runner
```

## Bring your own test runner

This plugin does not come packaged with it's own version of `vitest`, instead install your own version of `vitest` in your project. See [`@stryker-mutator/vitest-runner`'s package.json file](https://github.com/stryker-mutator/stryker-js/blob/master/packages/vitest-runner/package.json#L52) to discover the minimal required version of `vitest`.

## Configuring

You can configure the `@stryker-mutator/vitest-runner` using the `stryker.conf.js` (or `stryker.conf.json`) config file.

```json
{
  "testRunner": "vitest",
  "vitest": {
    "configFile": "vitest.config.js"
  }
}
```

### `vitest.configFile` [`string` | `undefined`]

Default: `undefined`

Specify a ['vitest.config.js' file](https://vitest.dev/config/) to be loaded. By default vitest will look for a `vitest.config.js` (or `.ts`) file in the root of your project.

## Non overridable options

The following options will be set by Stryker and cannot be overridden:

```javascript
{
  threads: true,
  coverage: { enabled: false },
  singleThread: true,
  watch: false,
  bail: options.disableBail ? 0 : 1,
  onConsoleLog: () => false,
}
```

As you can see, the vitest runner:
- Will run your tests in a **single thread**  
  This is done because StrykerJS uses it's own [parallel workers]('./parallel-workers.md').
- Will **bail** on the first test failure (unless you set `disableBail` to `true`).  
  This is done to boost performance.
- Will **disable code coverage reporting**  
  This is done because StrykerJS uses it's own [coverage analysis]('./configuration.md/#coverageanalysis-string'), which _is_ supported.

## Limitations

The vitest runner has the following limitations:

- Currently, only `threads: true` is supported. If you need it if off, please let us know by opening a [feature request](https://github.com/stryker-mutator/stryker-js/issues/new?assignees=&labels=%F0%9F%9A%80+Feature+request&projects=&template=feature_request.md&title=[vitest]+allow+disabled+threads+mode).
- Currently, [Browser Mode](https://vitest.dev/guide/browser.html) is not supported. If you're using browser mode and want support for it in StrykerJS, please open a [feature request](https://github.com/stryker-mutator/stryker-js/issues/new?assignees=&labels=%F0%9F%9A%80+Feature+request&projects=&template=feature_request.md&title=[vitest]+support+browser+mode)
- Your `coverageAnalysis` property is ignored. The vitest runner plugin will always use `"perTest"` coverage analysis (which yields the best performance anyway).