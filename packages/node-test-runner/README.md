[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fstryker-js%2Fmaster%3Fmodule%3Dnode-test-runner)](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/stryker-js/master?module=node-test-runner)
[![Build Status](https://github.com/stryker-mutator/stryker-js/workflows/CI/badge.svg)](https://github.com/stryker-mutator/stryker-js/actions?query=workflow%3ACI+branch%3Amaster)

![Stryker](https://github.com/stryker-mutator/stryker-js/raw/master/stryker-80x80.png)

# StrykerJS node:test Runner

A plugin to use the built-in [Node.js test runner](https://nodejs.org/api/test.html) (`node:test`) in [StrykerJS](https://stryker-mutator.io), the JavaScript mutation testing framework.

Unlike the generic `@stryker-mutator/tap-runner`, this plugin drives `node:test` through its
programmatic `run()` API with `isolation: 'none'`, so the instrumented code and the Stryker
coverage globals live in the same thread. That enables `coverageAnalysis: "perTest"`: coverage
is attributed to the test that triggered it, and each mutant only re-runs the test files that
cover it.

## Install

Install `@stryker-mutator/node-test-runner` locally within your project folder, like so:

```bash
npm i --save-dev @stryker-mutator/node-test-runner
```

## Configuration

Configure the `testRunner` setting and (optionally) the test file globs:

```json
{
  "testRunner": "node-test",
  "coverageAnalysis": "perTest",
  "nodeTest": {
    "testFiles": ["**/*.test.js", "test/**/*.js"],
    "concurrency": false
  }
}
```

| Option        | Description                                                                                                                                            | Default                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `testFiles`   | Glob expressions to the test files to run.                                                                                                            | `["**/*.@(test\|spec).@(js\|mjs\|cjs)", "**/test/**/*.@(js\|mjs\|cjs)"]` |
| `concurrency` | Run tests concurrently within a mutant run (the dry run is always serialized so perTest coverage can't race). Leave `false` if your tests share global state (e.g. global mocks), or concurrent runs may race and give incorrect results. | `false`                                                  |
| `nodeArgs`    | Extra Node.js arguments for the test process, e.g. `["--experimental-strip-types"]` for TypeScript or `["--import", "tsx"]` for a loader.             | `[]`                                                     |

## How it works

- Each dry run / mutant run executes in a **detached child process** (its own process group).
  `node:test`'s `run()` is not re-entrant (ESM modules can't be unloaded), so a fresh process gives
  a clean test registry every time, and a mutant can be activated before the SUT is imported (which
  is what static mutants need).
- A setup module registers a root `beforeEach` that records the current test id, so the
  instrumented coverage counters attribute hits per test.
- For each mutant, only the test files containing a covering test are run. Because `node:test`
  ignores `testNamePatterns` under `isolation: 'none'`, filtering is at file granularity — always
  a safe superset of the covering tests. The file is encoded into each test id, so this works
  without sharing state between the dry-run and mutant-run processes.
- **Bail and timeout** are enforced by killing the run's whole process group. `run()` ignores an
  `AbortSignal` under `isolation: 'none'`, so the only reliable way to stop the remaining tests on
  the first failure (when bail is enabled) — or on a timeout — is to kill the group. This also reaps
  any child processes the tests spawned, so they don't leak.

## Limitations

- Mutant-level test selection is file-granular: a covering test pulls in its whole file. (Test ids
  encode the file, so cross-file name collisions are handled correctly — only two identically-named
  tests in the *same* file share a coverage entry, which is cosmetic.)
- Requires Node.js >= 22.8.0 (when `run({ isolation: 'none' })` became available). The runner throws
  on older versions rather than silently mis-reporting.
- On Windows, killing the process group is best-effort (only the direct child is signalled), so a
  test that spawns grandchild processes and then times out may leave them running.
- A test that calls `process.exit()` is reported as an errored run (the test process can't be
  distinguished from a crash), not as a passing/surviving one.
