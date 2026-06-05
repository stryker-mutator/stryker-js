---
title: Node.js test runner
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/node-test-runner.md
---

_Since v9.7_

A plugin to use the [built-in Node.js test runner](https://nodejs.org/api/test.html) (`node:test`) in StrykerJS.

:::info

The node-test runner runs your test files in a fresh, [isolation-free](https://nodejs.org/api/test.html#runoptions) Node.js process per run. Isolation `'none'` is required so the instrumented code under test and Stryker's coverage globals share a single thread; it is available since Node 22.8.0, which is therefore the minimum supported version.

:::

## Install

Install @stryker-mutator/node-test-runner locally within your project folder, like so:

```shell
npm i --save-dev @stryker-mutator/node-test-runner
```

## Configuring

You can configure the node-test runner in the `stryker.config.json` (or `stryker.config.js`) file.

```json
{
  "testRunner": "node-test",
  "nodeTest": {
    "testFiles": ["test/**/*.spec.js"],
    "nodeArgs": ["--import", "tsx"],
    "concurrency": false
  }
}
```

The node-test runner will look for files that match the `testFiles` [glob expressions](./config-file.md#glob-patterns) and execute them with `node:test`, passing `nodeArgs` as additional node arguments.

### `nodeTest.testFiles` [`string[]`]

Default: `["**/*.@(test|spec).@(js|mjs|cjs)", "**/test/**/*.@(js|mjs|cjs)"]`

Specify [glob expressions](./config-file.md#glob-patterns) to your test files. By default the runner picks up files that end in `*.spec.js`/`*.test.js` (and the `.mjs`/`.cjs` variants), as well as any files inside a `test` directory. `node_modules` is always ignored.

:::tip

The defaults only match JavaScript files. If your tests are written in TypeScript, override `testFiles` to include them (e.g. `["test/**/*.spec.ts"]`) and load a loader through `nodeArgs` (e.g. `["--import", "tsx"]` or `["--experimental-strip-types"]`).

:::

### `nodeTest.nodeArgs` [`string[]`]

Default: `[]`

Additional Node.js arguments to pass when running your test files. For example, use `["--experimental-strip-types"]` to run TypeScript directly, or `["--import", "tsx"]` to register a loader.

### `nodeTest.concurrency` [`boolean`]

Default: `false`

Run tests concurrently within a single mutant run. The dry run is always serialized so that per-test coverage attribution cannot race; this option only affects mutant runs. Enabling it can speed up mutant runs for test suites that are safe to parallelize, at the cost of per-test coverage precision during those runs.

## Tips and tricks

- **TypeScript**  
  When you rely on a loader like `tsx` to run your TypeScript files, first try to run them yourself, for example with `node --import tsx test/my-test-file.spec.ts`. If that succeeds, add `"nodeArgs": ["--import", "tsx"]` to your `nodeTest` configuration and point `testFiles` at your `.ts` files.
- **Debugging**  
  Run Stryker with `--logLevel debug` to see how many test files were discovered and how runs are executed. The test process's own `stdout`/`stderr` is captured (not printed directly, so it can't garble the progress reporter); follow it live with `--logLevel trace`, or read the tail in the error message when a run crashes.
- **Performance**  
  When you're normally using a JIT compiler like `tsx` to run your tests, you can speed up mutation testing considerably by using a [`buildCommand`](./configuration.md#buildcommand-string) to compile your files first, then pointing `testFiles` at the compiled output.

## Limitations

- A fresh process is forked per run. This keeps the `node:test` registry clean and lets static mutants be activated before the code under test is imported, but it does add per-run process startup overhead.
- Bailing on the first failing test is implemented by killing the test process group. On non-Unix platforms (e.g. Windows) only the test process itself is terminated; child processes that your tests spawn may not be reaped.
- A `test()` (or `t.test()`) block that *wraps subtests* is reported as a test in its own right, in addition to each of its subtests, because `node:test` does not expose a way to tell such a parent apart from a leaf test. Grouping with `describe`/`it` avoids this — `describe` blocks are recognized as suites and are not counted as tests.
- When `coverageAnalysis` is set to `"all"`, coverage is still attributed per test (as with `"perTest"`). Mutation results are identical, but a purely static mutant may be reported as a regular (runtime) mutant rather than a static one.
- Coverage produced inside a *file-top-level* `afterEach` (one registered outside any `describe`) is attributed to `static` rather than the test that just ran, because the runner's own cleanup hook runs first. This affects only precision — such a mutant is run against the whole suite — and never mis-credits a different test. An `afterEach` nested in a `describe` is attributed normally.
