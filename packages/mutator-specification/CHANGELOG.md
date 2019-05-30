# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)


### Features

* **node 6:** drop support for node 6 ([#1517](https://github.com/stryker-mutator/stryker/issues/1517)) ([801d7cd](https://github.com/stryker-mutator/stryker/commit/801d7cd))


### BREAKING CHANGES

* **node 6:** support for Node 6 has been dropped. Node 8 or higher is now required.





## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)

**Note:** Version bump only for package @stryker-mutator/mutator-specification





## [1.0.0](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.7.1...@stryker-mutator/mutator-specification@1.0.0) (2019-02-13)


### Features

* **rename:** rename `stryker-xxx-xxx` -> `[@stryker-mutator](https://github.com/stryker-mutator)/xxx-xxx` ([1bbd6ff](https://github.com/stryker-mutator/stryker/commit/1bbd6ff))


### BREAKING CHANGES

* **rename:** The core package and plugins have been renamed: stryker-mutator-specification -> @stryker-mutator/mutator-specification





## [0.7.1](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.7.0...stryker-mutator-specification@0.7.1) (2019-02-08)

**Note:** Version bump only for package stryker-mutator-specification





<a name="0.7.0"></a>
# [0.7.0](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.6.0...stryker-mutator-specification@0.7.0) (2018-11-29)


### Bug Fixes

* **String literal mutator:** Don't mutate export declarations ([c764ccd](https://github.com/stryker-mutator/stryker/commit/c764ccd))


### Features

* **Conditional expression mutator:** Mutate conditional operators ([#1253](https://github.com/stryker-mutator/stryker/issues/1253)) ([be4c990](https://github.com/stryker-mutator/stryker/commit/be4c990))




<a name="0.6.0"></a>
# [0.6.0](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.5.1...stryker-mutator-specification@0.6.0) (2018-10-06)


### Features

* **mutator:** Object literal mutator ([#1169](https://github.com/stryker-mutator/stryker/issues/1169)) ([43d9a3a](https://github.com/stryker-mutator/stryker/commit/43d9a3a))




<a name="0.5.1"></a>
## [0.5.1](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.5.0...stryker-mutator-specification@0.5.1) (2018-09-30)


### Bug Fixes

* **mutator:** Fix empty case statement unkillable mutant ([#1159](https://github.com/stryker-mutator/stryker/issues/1159)) ([e080acb](https://github.com/stryker-mutator/stryker/commit/e080acb))




<a name="0.5.0"></a>
# [0.5.0](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.4.0...stryker-mutator-specification@0.5.0) (2018-09-14)


### Features

* **mutator:** add SwitchCase statement mutator ([#1127](https://github.com/stryker-mutator/stryker/issues/1127)) ([cec6a39](https://github.com/stryker-mutator/stryker/commit/cec6a39))




<a name="0.4.0"></a>
# [0.4.0](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.3.1...stryker-mutator-specification@0.4.0) (2018-07-20)


### Features

* **logging:** Allow log to a file ([#954](https://github.com/stryker-mutator/stryker/issues/954)) ([c2f6b82](https://github.com/stryker-mutator/stryker/commit/c2f6b82)), closes [#748](https://github.com/stryker-mutator/stryker/issues/748)




<a name="0.3.1"></a>
## [0.3.1](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.3.0...stryker-mutator-specification@0.3.1) (2018-05-31)


### Bug Fixes

* **String mutator:** do not mutate prologue directives ([#829](https://github.com/stryker-mutator/stryker/issues/829)) ([6e80251](https://github.com/stryker-mutator/stryker/commit/6e80251))




<a name="0.3.0"></a>
# [0.3.0](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.2.3...stryker-mutator-specification@0.3.0) (2018-04-30)


### Features

* **node version:** drop node 4 support ([#724](https://github.com/stryker-mutator/stryker/issues/724)) ([a038931](https://github.com/stryker-mutator/stryker/commit/a038931))


### BREAKING CHANGES

* **node version:** Node 4 is no longer supported.




<a name="0.2.3"></a>
## [0.2.3](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.2.2...stryker-mutator-specification@0.2.3) (2018-04-20)


### Bug Fixes

* **String mutator:** do not mutate jsx attributes ([#711](https://github.com/stryker-mutator/stryker/issues/711)) ([6656621](https://github.com/stryker-mutator/stryker/commit/6656621)), closes [#701](https://github.com/stryker-mutator/stryker/issues/701)




<a name="0.2.2"></a>
## [0.2.2](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.2.1...stryker-mutator-specification@0.2.2) (2018-03-21)




**Note:** Version bump only for package stryker-mutator-specification

<a name="0.2.1"></a>
## [0.2.1](https://github.com/stryker-mutator/stryker/compare/stryker-mutator-specification@0.2.0...stryker-mutator-specification@0.2.1) (2018-01-12)




**Note:** Version bump only for package stryker-mutator-specification

<a name="0.2.0"></a>
# 0.2.0 (2017-11-24)


### Features

* **JavaScript mutator:** Add stryker-javascript-mutator package ([#467](https://github.com/stryker-mutator/stryker/issues/467)) ([06d6bac](https://github.com/stryker-mutator/stryker/commit/06d6bac)), closes [#429](https://github.com/stryker-mutator/stryker/issues/429)
