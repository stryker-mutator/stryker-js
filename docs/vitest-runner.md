---
title: Vitest Runner
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/vitest-runner.md
---

_Since v7.0_

A plugin to use the [vitest](https://vitest.dev/) test runner in Stryker.

## Install

Install `@stryker-mutator/vitest-runner` locally within your project folder, like so:

```bash
npm i --save-dev @stryker-mutator/vitest-runner
```

## Bring your own test runner

This plugin does not come packaged with it's own version of `vitest`, instead install your own version of `vitest` in your project. See [`@stryker-mutator/vitest-runner`'s package.json file](https://github.com/stryker-mutator/stryker-js/blob/master/packages/vitest-runner/package.json#L52) to discover the minimal required version of `vitest`.

## Configuring

You can configure the `@stryker-mutator/vitest-runner` using the `stryker.config.json` (or `stryker.config.js`) config file.

```json
{
  "testRunner": "vitest",
  "vitest": {
    "configFile": "vitest.config.js",
    "dir": "packages"
  }
}
```

### `vitest.configFile` [`string` | `undefined`]

Default: `undefined`

Specify a ['vitest.config.js' file](https://vitest.dev/config/) to be loaded. By default vitest will look for a `vitest.config.js` (or `.ts`) file in the root of your project.

### `vitest.dir` [`string` | `undefined`]

_Since v7.1_

Default: `undefined`

Configure the `--dir <path>` command line option. See https://vitest.dev/guide/cli.html#options.

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
  This is done because StrykerJS uses it's own [parallel workers](./parallel-workers.md).
- Will **bail** on the first test failure (unless you set `disableBail` to `true`).  
  This is done to boost performance.
- Will **disable code coverage reporting**  
  This is done because StrykerJS uses it's own [coverage analysis](./configuration.md#coverageanalysis-string), which _is_ supported.

## In-source testing

Vitest's [in-source testing](https://vitest.dev/guide/in-source.html) is supported. However, since your tests are in the same file as your code-under-test, you will need to make sure to exclude your tests from being mutated.

For example, you can add the Stryker disable comment (`// Stryker disable all`) right before `if (import.meta.vitest)` like so:

```diff
 export function add(...args: number[]) {
   return args.reduce((a, b) => a + b, 0)
 }
 
 
 // in-source test suites
+// Stryker disable all: Unit tests start here
 if (import.meta.vitest) {
   const { it, expect } = import.meta.vitest
   it('add', () => {
     expect(add(1, 2, 3)).toBe(6)
   })
 }
```


## Limitations

The vitest runner has the following limitations:

- Currently, only `threads: true` is supported. If you need it if off, please let us know by opening a [feature request](https://github.com/stryker-mutator/stryker-js/issues/new?assignees=&labels=%F0%9F%9A%80+Feature+request&projects=&template=feature_request.md&title=[vitest]+allow+disabled+threads+mode).
- Currently, [Browser Mode](https://vitest.dev/guide/browser.html) is not supported. If you're using browser mode and want support for it in StrykerJS, please open a [feature request](https://github.com/stryker-mutator/stryker-js/issues/new?assignees=&labels=%F0%9F%9A%80+Feature+request&projects=&template=feature_request.md&title=[vitest]+support+browser+mode)
- Your `coverageAnalysis` property is ignored. The vitest runner plugin will always use `"perTest"` coverage analysis (which yields the best performance anyway).
