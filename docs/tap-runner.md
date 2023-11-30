---
title: Tap Runner
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/tap-runner.md
---

_Since v7.0_

A plugin to use test files producing TAP-output in StrykerJS.

:::tip

Test files producing TAP-output are usually produced by tests using the [`node-tap`](https://node-tap.org/) test runner, the [build-in node test runner](https://nodejs.org/api/test.html) or [Ava using `--tap`](https://github.com/avajs/ava).

:::

:::info

The tap runner doesn't use [`node-tap`](https://node-tap.org/) (or similar) to run your files. As such, you are responsible for compiling typescript files, or loading any other dependencies you might need.

:::

## Install

Install @stryker-mutator/tap-runner locally within your project folder, like so:

```shell
npm i --save-dev @stryker-mutator/tap-runner
```

## Configuring

You can configure the tap test runner in the `stryker.config.json` (or `stryker.config.js`) file.

```json
{
  "testRunner": "tap",
  "tap": {
    "testFiles": ["test/**/*.@(js|ts)"],
    "nodeArgs": ["--loader", "ts-node/esm"],
    "forceBail": true
  }
}
```

The tap runner will look for files that match the `testFiles` [glob expressions](./config-file.md#glob-patterns) and execute them using the `nodeArgs` as additional node arguments.

### `tap.testFiles` [`string[]`]

Default: `["{**/@(test|tests|__test__|__tests__)/**,**/*.@(test|tests|spec)}.@(cjs|mjs|js|jsx|ts|tsx|mts|cts)"]`

Specify [glob expressions](./config-file.md#glob-patterns) to your test files. By default, the tap runner will look for testy-looking files, like files in the `test` directory, as well as any files that end in `*.spec.js` or `*.test.js`. If you want to run a specific file, you should override this setting.

### `tap.nodeArgs` [`string[]`]

<details>

<summary>History</summary>

| Version | Changes                                                   |
| ------- | --------------------------------------------------------- |
| 7.1     | Add `{{hookFile}}` and `{{testFile}}` placeholder support |

</details>

Default: `["-r", "{{hookFile}}", "{{testFile}}"]`

Specify node arguments to be used when running the tests. You can use the following placeholders:

| Variable         | Replacement                          | Default                                                       |
| ---------------- | ------------------------------------ | ------------------------------------------------------------- |
| `'{{hookFile}}'` | The actual location to the hook file | By default it will be prepended `['-r', '{{hookFile}}', ...]` |
| `'{{testFile}}'` | The test file to run                 | By default it will appended last: `[..., '{{testFile}}']`     |

When the placeholder are not used, the defaults will be applied as described above.

#### Examples

| Config                                                                                    | Generated actual node arguments                                                                                  | Explanation                                                      |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `[]`                                                                                      | `["-r", "actual/hook.cjs", "test/foo.spec.js"]`                                                                  | The default, works when using raw JavaScript test files as input |
| `["--loader", "ts-node/esm"]`                                                             | `["-r", "actual/hook.cjs", "--loader", "ts-node/esm", "test/foo.spec.js"]`                                       | If you want to use `ts-node` to run your tests                   |
| `["node_modules/ava/entrypoints/cli.mjs", "--tap", "--node-arguments='-r {{hookFile}}'"]` | `["node_modules/ava/entrypoints/cli.mjs", "--tap", "--node-arguments='-r actual/hook.cjs'", "test/foo.spec.js"]` | If you are running test with [Ava](https://github.com/avajs/ava) |

:::info

The hook file is used to capture test metrics. It is important that it is loaded inside the test environment. Usually, this is done by using the [`-r` node argument](https://nodejs.org/api/cli.html#-r---require-module). However, some test runners (like Ava) run the test files in a separate [process or worker_thread](https://nodejs.org/api/process.html). For those use cases you should consult the documentation of the test runner in question to find a way to provide the hook file in the test environment.

:::

### `tap.forceBail` [`boolean`]

Default: `true`

This option is typically set to false when a test runner uses child processes to run the tests. When set to `true`, the tap runner will force the test runner to stop after the first failed test. This is useful when you want to speed up mutation testing, as it will prevent the test runner from running all tests, even when the first test already failed. But when the test runner uses child processes, it can cause the test runner to stop prematurely which results in Stryker failing to complete.

## Tips and tricks

- **Configuring**  
  When you rely on your test runner to compile your typescript files, you should first try to run them yourself, for example by using `node --loader ts-node/esm test/my-test-file.spec.ts`. If that succeeds, you can proceed to add `"nodeArgs": ["--loader", "ts-node/esm"]` to your `tap` configuration.
- **Debugging**  
  You can run Stryker with `--logLevel debug` to see the actual node arguments that are used to run your tests.
- **Performance**  
  When you're normally using a JIT compiler like `ts-node` to run your tests, you can speed up mutation testing considerably by using a [`buildCommand`](./configuration.md#buildcommand-string) to compile your files before running them.

  ```diff
  {
  + "buildCommand": "tsc",
    "tap": {
  +   "testFiles": ["dist/test/**/*.js"],
  -   "nodeArgs": ["--loader", "ts-node/esm"],
  -   "testFiles": ["test/**/*.ts"]
    }
  }
  ```

## Limitations

The tap runner is a simple test runner. As such, it has some limitations:

- It doesn't support fine-grained test reporting. A test is always a test file.
- Each test file is always run in a separate process. This can become slow when you have a lot of test files and a lot of mutants, especially when you're using a JIT compiler like `ts-node`.
- Coverage is always recorded per test, which means that coverage is measured per test file. [Static mutants](../mutation-testing-elements/static-mutants.md) are undetectable.
