# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.3.0](https://github.com/stryker-mutator/stryker/compare/v3.2.4...v3.3.0) (2020-06-16)

**Note:** Version bump only for package @stryker-mutator/test-helpers





## [3.2.4](https://github.com/stryker-mutator/stryker/compare/v3.2.3...v3.2.4) (2020-05-18)

**Note:** Version bump only for package @stryker-mutator/test-helpers





## [3.2.3](https://github.com/stryker-mutator/stryker/compare/v3.2.2...v3.2.3) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/test-helpers





## [3.2.2](https://github.com/stryker-mutator/stryker/compare/v3.2.1...v3.2.2) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/test-helpers





## [3.2.1](https://github.com/stryker-mutator/stryker/compare/v3.2.0...v3.2.1) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/test-helpers





# [3.2.0](https://github.com/stryker-mutator/stryker/compare/v3.1.0...v3.2.0) (2020-05-13)


### Features

* **validation:**  validate StrykerOptions using JSON schema ([5f05665](https://github.com/stryker-mutator/stryker/commit/5f0566581abdd1229dfe5d27a25a676bec93d8f8))
* **validation:** add validation on plugin options ([#2158](https://github.com/stryker-mutator/stryker/issues/2158)) ([d78fe1e](https://github.com/stryker-mutator/stryker/commit/d78fe1e013ac2e309a29f0def3029492b1e6c1ea))
* **validation:** warn about unknown stryker config options ([#2164](https://github.com/stryker-mutator/stryker/issues/2164)) ([8c6fd97](https://github.com/stryker-mutator/stryker/commit/8c6fd972dc57e246d361132dc176920d380c91cc)), closes [#2103](https://github.com/stryker-mutator/stryker/issues/2103)






# [3.1.0](https://github.com/stryker-mutator/stryker/compare/v3.0.2...v3.1.0) (2020-03-29)

**Note:** Version bump only for package @stryker-mutator/test-helpers





## [3.0.2](https://github.com/stryker-mutator/stryker/compare/v3.0.1...v3.0.2) (2020-03-13)

**Note:** Version bump only for package @stryker-mutator/test-helpers





## [3.0.1](https://github.com/stryker-mutator/stryker/compare/v3.0.0...v3.0.1) (2020-03-12)

**Note:** Version bump only for package @stryker-mutator/test-helpers





# [3.0.0](https://github.com/stryker-mutator/stryker/compare/v2.5.0...v3.0.0) (2020-03-11)


### Bug Fixes

* **mocha:**  support mutants with "runAllTests" ([#2037](https://github.com/stryker-mutator/stryker/issues/2037)) ([a9da18a](https://github.com/stryker-mutator/stryker/commit/a9da18aa67845db943c5ce8ebd69b368b34e134e)), closes [#2032](https://github.com/stryker-mutator/stryker/issues/2032)


### Features

* **Reporter.onScoreCalculated:** remove deprecated onScoreCalculatedevent ([#2026](https://github.com/stryker-mutator/stryker/issues/2026)) ([9fa4175](https://github.com/stryker-mutator/stryker/commit/9fa41757d7bed58c98bc3fbd0c8c861670fbd025))


### BREAKING CHANGES

* **Reporter.onScoreCalculated:** Please use the `onMutationTestReportReady` event and the `mutation-testing-metrics` npm package to calculate the mutation testing report metrics.

This
```ts
class MyReporter {
  onScoreCalculated(scoreResult) {
     // => do stuff with score result
  }
}
```

Becomes this:
```ts
import { calculateMetrics } from 'mutation-testing-metrics';
class MyReporter {
  onMutationTestingReportReady(report){
    const reportMetrics = calculateMetrics(report.files);
    // => do stuff with report metrics
  }
}
```






# [2.5.0](https://github.com/stryker-mutator/stryker/compare/v2.4.0...v2.5.0) (2020-01-12)

**Note:** Version bump only for package @stryker-mutator/test-helpers





# [2.4.0](https://github.com/stryker-mutator/stryker/compare/v2.3.0...v2.4.0) (2019-11-24)


### Features

* **report:** support upload of full report to dashboard ([#1783](https://github.com/stryker-mutator/stryker/issues/1783)) ([fbb8102](https://github.com/stryker-mutator/stryker/commit/fbb8102))





# [2.3.0](https://github.com/stryker-mutator/stryker/compare/v2.2.1...v2.3.0) (2019-11-13)

**Note:** Version bump only for package @stryker-mutator/test-helpers





## [2.2.1](https://github.com/stryker-mutator/stryker/compare/v2.2.0...v2.2.1) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/test-helpers





# [2.2.0](https://github.com/stryker-mutator/stryker/compare/v2.1.0...v2.2.0) (2019-11-06)


### Features

* **javascript-mutator:** allow to override babel plugins ([#1764](https://github.com/stryker-mutator/stryker/issues/1764)) ([ddb3d60](https://github.com/stryker-mutator/stryker/commit/ddb3d60))
* **mutant-matcher:** lower memory usage ([#1794](https://github.com/stryker-mutator/stryker/issues/1794)) ([16294e5](https://github.com/stryker-mutator/stryker/commit/16294e5))





# [2.1.0](https://github.com/stryker-mutator/stryker/compare/v2.0.2...v2.1.0) (2019-09-08)


### Features

* **mocha:** support mocha 6.2 ([feddcf1](https://github.com/stryker-mutator/stryker/commit/feddcf1))





## [2.0.2](https://github.com/stryker-mutator/stryker/compare/v2.0.1...v2.0.2) (2019-07-11)


### Bug Fixes

* **dispose:** fix race condition in dispose action ([124ef6a](https://github.com/stryker-mutator/stryker/commit/124ef6a)), closes [#1542](https://github.com/stryker-mutator/stryker/issues/1542)





## [2.0.1](https://github.com/stryker-mutator/stryker/compare/v2.0.0...v2.0.1) (2019-07-02)

**Note:** Version bump only for package @stryker-mutator/test-helpers





# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)

**Note:** Version bump only for package @stryker-mutator/test-helpers





## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)

**Note:** Version bump only for package @stryker-mutator/test-helpers





# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)

**Note:** Version bump only for package @stryker-mutator/test-helpers





# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)


### Features

* **reporter:** implement `mutationTestReport` ([16ba76b](https://github.com/stryker-mutator/stryker/commit/16ba76b))





## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)

**Note:** Version bump only for package @stryker-mutator/test-helpers





# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)

**Note:** Version bump only for package @stryker-mutator/test-helpers





## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)

**Note:** Version bump only for package @stryker-mutator/test-helpers





## [1.0.1](https://github.com/stryker-mutator/stryker/compare/v1.0.0...v1.0.1) (2019-02-13)

**Note:** Version bump only for package @stryker-mutator/test-helpers





## [1.0.0](https://github.com/stryker-mutator/stryker/compare/@stryker-mutator/test-helpers@0.1.1...@stryker-mutator/test-helpers@1.0.0) (2019-02-13)


### Features

* **init:** Make stryker init work with new naming scheme ([fefd0ae](https://github.com/stryker-mutator/stryker/commit/fefd0ae))
* **rename:** rename `stryker-xxx-xxx` -> `[@stryker-mutator](https://github.com/stryker-mutator)/xxx-xxx` ([1bbd6ff](https://github.com/stryker-mutator/stryker/commit/1bbd6ff))


### BREAKING CHANGES

* **rename:** The core package and plugins have been renamed: stryker-test-helpers -> @stryker-mutator/test-helpers





## [0.1.1](https://github.com/stryker-mutator/stryker/compare/@stryker-mutator/test-helpers@0.1.0...@stryker-mutator/test-helpers@0.1.1) (2019-02-12)


### Bug Fixes

* **mutants:** Prevent memory leak when transpiling mutants ([#1376](https://github.com/stryker-mutator/stryker/issues/1376)) ([45c2852](https://github.com/stryker-mutator/stryker/commit/45c2852)), closes [#920](https://github.com/stryker-mutator/stryker/issues/920)





# 0.1.0 (2019-02-08)


### Features

* **config-editors:** Remove side effects from all config editor plugins ([#1317](https://github.com/stryker-mutator/stryker/issues/1317)) ([1f61bed](https://github.com/stryker-mutator/stryker/commit/1f61bed))
* **dependency injection:** Add dependency injection for plugins ([#1313](https://github.com/stryker-mutator/stryker/issues/1313)) ([f90cd56](https://github.com/stryker-mutator/stryker/commit/f90cd56)), closes [#667](https://github.com/stryker-mutator/stryker/issues/667)
* **test-runner:** Use new plugin system to load TestRunner plugins ([#1361](https://github.com/stryker-mutator/stryker/issues/1361)) ([266247b](https://github.com/stryker-mutator/stryker/commit/266247b))
* **transpilers:** Remove side effects transpiler plugins ([#1351](https://github.com/stryker-mutator/stryker/issues/1351)) ([9a8b539](https://github.com/stryker-mutator/stryker/commit/9a8b539))
