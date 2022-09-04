---
title: Incremental
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/incremental.md
---

StrykerJS is fast! It uses advanced techniques to speed up mutation testing, like coverage analysis, hit limit counters, and hot-reload. However, mutation testing still takes time. You might want to speed things up further for larger code bases, fast feedback, or Continuous Integration (CI) scenarios.

## Incremental mode

_Available since Stryker 6.2_

StrykerJS supports incremental mutation testing to speed things up further. When running in [`--incremental`](./configuration.md#incremental-boolean) mode, StrykerJS will track the changes you make to your code and tests and only runs mutation testing on the changed code. But, of course, it will still provide you with the full mutation report at the end!

You enable incremental mode with the `--incremental` flag:

```
npx stryker run --incremental
```

_Setting `"incremental": true` in your stryker.conf.json file is also supported_

StrykerJS stores the previous result in a "reports/stryker-incremental.json" file (determined by the [--incrementalFile](./configuration.md#incrementalfile-string) option). The next time StrykerJS runs, it will read this JSON file and try to reuse as much of it as possible. 

Reuse is possible when:
- A mutant was "Killed"; the culprit test still exists, and it didn't change.
- A mutant was not "Killed"; no new test covers it, and no tests changed.

StrykerJS will do a git-like diff of your code and test files to the previous version it finds in the incremental report file in order to match the mutants and tests to the current version of the code.

You can see the statistics of the incremental analysis right after the dry run is performed. It looks like this:

```
        Mutants:        1 files changed (+2 -2)
        Tests:          2 files changed (+22 -21)
        Result:         3731 of 3965 mutant result(s).
```

Here you can see that:
- One file with mutants changed (2 mutants added, 2 mutants removed)
- Two test files changed (22 tests added and 21 tests removed)
- In total, Stryker will reuse 3731 mutant results, and only 234 mutants need to run.

**Note**: The dry run remains required; as it discovers tests, mutation coverage per test, and ensures Stryker runs successfully when no mutant is active.

## Limitations

Running in incremental mode, Stryker will do its best to produce an accurate mutation testing report. However, there are some limitations here:
- Stryker will not detect any changes you've made in files other than mutated files and test files.
- Detecting test file changes is only supported if the test runner plugin supports reporting the test files. (see support table below)
- Detecting test changes is only supported if the test runner plugin supports reporting test locations. (see support table below)
- Any other changes to your environment are not detected, such as updates to other files, updated (dev) dependencies, changes to environment variables, changes to `.snap` files, readme files, etc.
- [Static mutants](../../mutation-testing-elements/static-mutants/) don't have test coverage; thus, Stryker won't detect test changes for them.

| Test runner plugin | Test reporting                  |
| ------------------ | ------------------------------- |
| 🃏 Jest            | ✅ Full                            |
| ☕ Mocha           | ⚠ Tests per file without location |
| 🟣 Jasmine         | ⚠ Test names only                 |
| 🔵 Karma           | ⚠ Test names only                 |
| 🥒 CucumberJS      | ✅ Full                            |
| ▶ Command          | ❌ Nothing                         |

You can use this table to understand why StrykerJS decides not to rerun a specific mutant even though you've changed tests covering that mutant.

- **Full**  
  Tests are reported together with their exact locations. Stryker will do a detailed diff to see which specific tests changed.
- **Tests per file without location**  
  Stryker knows from which files the tests originated, but not their exact locations. Therefore, Stryker assumes all tests inside a file changed when that file changed.
- **Test names only**  
  Stryker can't determine where the tests are located and thus cannot detect when a test changed. As a result, Stryker will only see test changes for tests that are added or removed.
- **Nothing**  
  All test details are unknown incremental mode will only detect changes in mutants, not their tests.

## Forcing reruns

With these limitations in mind, you can probably imagine a scenario where you want to force specific mutants to run while using incremental mode. You can do this with `--force`. If you run `--force`, you tell StrykerJS to rerun all mutants in scope, regardless of the incremental file.

Using `--force` is especially beneficial when combined with a custom `--mutate` pattern. I.e., if you only want to rerun the mutants in `src/app.js`, you use:

```
npx stryker run --incremental --force --mutate src/app.js
```

You can even specify individual lines to mutate:

```
npx stryker run --incremental --force --mutate src/app.js:5-7
```

In this example, you tell Stryker to only run mutation testing for lines 5 through 7 in the `src/app.js` file and update the incremental report.

Using the combination of `--incremental` with a custom `--mutate` pattern, StrykerJS will not remove mutants that are not in scope and still report a full mutation report.
