---
title: Performance report (experimental)
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/performance-report.md
---

The experimental performance report is an opt-in, machine-readable breakdown of where time goes
during a mutation test run. It is meant for diagnosing and comparing performance, not for regular
reporting. Enable it with [`experimentalPerformanceReport`](./configuration.md#experimentalperformancereport-boolean):

```json
{
  "experimentalPerformanceReport": true
}
```

When enabled, Stryker writes `reports/mutation/performance.json`. The standard reports
(`mutation.json`, the HTML report) are unchanged.

:::caution
The format is **experimental and unstable**; fields may change or be removed between releases.
:::

## Reading the numbers

All times are in **milliseconds**. Two kinds of duration appear, and mixing them up is the easiest
mistake to make:

- **Wall time** – real elapsed time. Used for the top-level `totalWallMs` and the `phases` that
  partition it (`setup`, `initialRun`, `mutation`, `reporting`).
- **Summed work** – the sum of individual durations across everything that ran, including work that
  ran **in parallel**. With concurrency > 1 these values can exceed the matching wall time; they are
  meant for relative comparison, not as elapsed time. This applies to `phases.check`,
  `phases.testRun`, `totals.static.wallMs`, `totals.runtime.wallMs`, and each worker's `busyWallMs`.

## Fields

### `phases` (wall time, exhaustive)

`setup + initialRun + mutation + reporting === totalWallMs`.

| Field                | Meaning                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `setup`              | Process start until the initial (dry) run starts: config, instrumentation, sandbox creation.    |
| `initialRun`         | The dry run.                                                                                    |
| `initialRunNet`      | Sum of the individual test times during the dry run.                                            |
| `initialRunOverhead` | `initialRun − initialRunNet` (runner start-up etc.).                                            |
| `mutation`           | From the end of the dry run until all mutants have been tested: planning, checking and running. |
| `check`              | **Summed** time spent in type checkers (0 when no checker is configured).                       |
| `testRun`            | **Summed** per-mutant run time across all workers.                                              |
| `reporting`          | Generating and writing the reports after the last mutant.                                       |

`check` and `testRun` are breakdowns of work done _during_ the `mutation` phase; because they are
summed across workers they do not add up to the `mutation` wall time.

### `totals`

| Field                       | Meaning                                                                                                                                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `byPlanKind`                | Counts of `earlyResult` / `noCoverage` / `static` / `runtime` mutants, taken from the **plan** (before checking/running).                                                                                                                                                            |
| `byStatus`                  | Counts per mutant **outcome** status (`Killed`, `CompileError`, `Survived`, …).                                                                                                                                                                                                      |
| `static`                    | For static mutants **that ran**: `count`, `wallMs` (**summed**), `reloads` (count triggered _by_ static mutants), `reloadWallMs` (**summed**).                                                                                                                                       |
| `runtime`                   | For runtime mutants **that ran**: `count`, `wallMs` (**summed**).                                                                                                                                                                                                                    |
| `reload`                    | **All** reloads: `count` and `wallMs` (**summed**). This is `>= static.reloads`, because a reload also fires on the first runtime mutant after a static one (to clear it); that reload is attributed to the runtime mutant, so `static.reloads` alone understates total reload cost. |
| `staticShareOfMutantWallMs` | `static.wallMs / (static.wallMs + runtime.wallMs)` — the share of mutant-execution **work** spent on static mutants. Concurrency-independent.                                                                                                                                        |
| `staticShareOfCount`        | Share of run mutants that are static.                                                                                                                                                                                                                                                |
| `retries`                   | Test-runner restarts after a crash.                                                                                                                                                                                                                                                  |
| `oomRestarts`               | Test-runner restarts after running out of memory.                                                                                                                                                                                                                                    |

### `workers`

One entry per test-runner process, with `mutantsHandled`, `busyWallMs` (**summed** run time on that
worker) and `idleWallMs` (time the worker waited between mutants). Useful for spotting an
under-utilized parallel tail.

### `mutants`

One entry per mutant that was run (early-result and no-coverage mutants are counted in
`totals.byPlanKind` but not listed here):

| Field                 | Meaning                                                                            |
| --------------------- | ---------------------------------------------------------------------------------- |
| `wallMs`              | Wall time of this mutant's run, including any environment reload it triggered.     |
| `reloadWallMs`        | Time spent reloading the environment for this mutant. See the reload caveat below. |
| `static` / `reloaded` | Whether the mutant is static, and whether its run reloaded the environment.        |
| `workerId`            | The worker that ran it.                                                            |
| `selectedTests`       | Number of tests selected for this mutant (whole suite for static mutants).         |
| `coveredBy`           | Number of tests covering this mutant.                                              |
| `testsCompleted`      | Number of tests actually executed (can be fewer than `selectedTests` due to bail). |

## Caveats

- **`reloadWallMs` only measures full worker restarts.** Runners that reload in-process (vitest,
  jest) fold the reload into the mutant's `wallMs` without breaking it out, so `reloadWallMs` is `0`
  for them even when `reloaded` is `true`. Runners that restart the whole process (mocha, jasmine,
  karma, tap) report the restart time in `reloadWallMs`.
- **Summed values scale with concurrency.** Compare them against other summed values, not against
  wall-clock phases.
- **Planned vs run.** `context.mutants` is the total; `context.mutantsRun` is how many actually
  reached the test runner. Mutants that were ignored, had no coverage, or were killed by a checker
  (`CompileError`) never run, so they appear in `totals.byPlanKind` / `totals.byStatus` but **not**
  in the `static`/`runtime` wall totals or the `mutants` array. On a TypeScript project a large
  fraction can be `CompileError`, so `mutantsRun` is often much smaller than `mutants`.
