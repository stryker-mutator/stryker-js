# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.9.1"></a>
## [0.9.1](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.9.0...stryker-karma-runner@0.9.1) (2017-10-24)




**Note:** Version bump only for package stryker-karma-runner

<a name="0.9.0"></a>
## [0.9.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.8.0...stryker-karma-runner@0.9.0) (2017-10-20)




**Note:** Version bump only for package stryker-karma-runner

<a name="0.8.0"></a>
# [0.8.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.7.1...stryker-karma-runner@0.8.0) (2017-09-19)


### Features

* **typescript:** Add support for TypeScript mutation testing (#376) ([ba78168](https://github.io/stryker-mutator/stryker/commit/ba78168))


### BREAKING CHANGES

* **typescript:** * Hoist the `Mutator` interface to a higher abstraction. With this interface it was possible to add mutators for specific ES5 AST nodes. As we're moving away from ES5, this plugin abstraction had to be hoisted to a higher level. It is no longer possible to plugin a specific ES5 node mutator.
* Update `report` interface: Rename `MutantState.Error` => `MutantState.RuntimeError`. 




<a name="0.7.1"></a>
## [0.7.1](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.7.0...stryker-karma-runner@0.7.1) (2017-09-03)




**Note:** Version bump only for package stryker-karma-runner

<a name="0.7.0"></a>
# [0.7.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.6.0...stryker-karma-runner@0.7.0) (2017-08-25)


### Code Refactoring

* change ConfigWriter interface name to ConfigEditor (#357) ([ec4ae03](https://github.io/stryker-mutator/stryker/commit/ec4ae03))


### BREAKING CHANGES

* Public api for `ConfigWriter` is renamed to `ConfigEditor`. The corresponding `write` method is renamed to `edit`. If you're using custom `ConfigWriter` plugins you should rename the `write` method to `edit`. Please update the `stryker-mocha-framework` and `stryker-karma-runner` to the latest versions as they provide the new `ConfigEditor` plugin.




<a name="0.6.0"></a>
# [0.6.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.5.0...stryker-karma-runner@0.6.0) (2017-08-11)


### Features

* **ci-integration:** Configurable thresholds based on mutation score (#355) ([93f28cc](https://github.io/stryker-mutator/stryker/commit/93f28cc)), closes [#220](https://github.io/stryker-mutator/stryker/issues/220)




<a name="0.5.0"></a>
## [0.5.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.4.5...stryker-karma-runner@0.5.0) (2017-08-04)




<a name="0.4.5"></a>
## [0.4.5](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.4.4...stryker-karma-runner@0.4.5) (2017-07-14)


### Bug Fixes

* **ts-2.4:** Fix type issues for typescript 2.4 (#337) ([c18079b](https://github.io/stryker-mutator/stryker/commit/c18079b)), closes [#337](https://github.io/stryker-mutator/stryker/issues/337)




<a name="0.4.4"></a>
## [0.4.4](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.4.3...stryker-karma-runner@0.4.4) (2017-06-16)


### Bug Fixes

* **npmignore:** Align npm ignores (#321) ([db2a56e](https://github.io/stryker-mutator/stryker/commit/db2a56e))




<a name="0.4.2"></a>
## [0.4.2](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.4.1...stryker-karma-runner@0.4.2) (2017-06-08)




<a name="0.4.1"></a>
## 0.4.1 (2017-06-02)

<a name="0.4.0"></a>
# 0.4.0 (2017-04-21)


### Bug Fixes

* **deps:** Add support for karma ^1.1.1 ([149ecd2](https://github.io/stryker-mutator/stryker/commit/149ecd2))
* **deps:** Update stryker-api version ([07ab5b0](https://github.io/stryker-mutator/stryker/commit/07ab5b0))
* **deps:** Update stryker-api version ([0207787](https://github.io/stryker-mutator/stryker/commit/0207787))
* **README:** Use lerna project structure ([fc15678](https://github.io/stryker-mutator/stryker/commit/fc15678))
* **TestRunner:** Remove stopper (#16) ([e65d6ab](https://github.io/stryker-mutator/stryker/commit/e65d6ab))


### Features

* **es2015-promise:** Remove dep to es6-promise (#9) ([d5ad84b](https://github.io/stryker-mutator/stryker/commit/d5ad84b))
* **KarmaTestRunner:** Force cwd as basePath (#18) ([205a393](https://github.io/stryker-mutator/stryker/commit/205a393))
* **life-cycle:** Add init lifecycle event. ([51a756f](https://github.io/stryker-mutator/stryker/commit/51a756f))
* **lifetime-support:** Drop Node 0.12 support (#14) ([aa85cd7](https://github.io/stryker-mutator/stryker/commit/aa85cd7))
* **one-pass-coverage:** Enable one pass coverage (#6) ([3c9e6e1](https://github.io/stryker-mutator/stryker/commit/3c9e6e1))
* **package.json:** Upgrade to TypeScript 2.1 (#13) ([456e6aa](https://github.io/stryker-mutator/stryker/commit/456e6aa))
* **read-karma-config:** Use karma configuration (#10) ([93e26f5](https://github.io/stryker-mutator/stryker/commit/93e26f5))
* **stop-karma:** Stop karma on dispose (#11) ([aab66a2](https://github.io/stryker-mutator/stryker/commit/aab66a2))
* **test-runner:** Allow for big coverage objects ([dff523e](https://github.io/stryker-mutator/stryker/commit/dff523e))
* **testFramework:** Use test framework (#3) ([eb7cb13](https://github.io/stryker-mutator/stryker/commit/eb7cb13))
* **ts2.0:** Migrate to typescript 2.0 (#5) ([d344bce](https://github.io/stryker-mutator/stryker/commit/d344bce))
* **unincluded-files:** Unincluded files support ([302ce73](https://github.io/stryker-mutator/stryker/commit/302ce73))




<a name="0.3.5"></a>
## [0.3.5](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.3.4...v0.3.5) (2017-03-01)


### Features

* **KarmaTestRunner:** Force cwd as basePath (#18) ([5df1090](https://github.io/stryker-mutator/stryker-karma-runner/commit/5df1090))



<a name="0.3.4"></a>
## [0.3.4](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.3.3...v0.3.4) (2017-01-29)


### Bug Fixes

* **TestRunner:** Remove stopper (#16) ([f2f9e78](https://github.io/stryker-mutator/stryker-karma-runner/commit/f2f9e78))



<a name="0.3.3"></a>
## [0.3.3](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.3.2...v0.3.3) (2016-12-30)


### Features

* **lifetime-support:** Drop Node 0.12 support (#14) ([16724af](https://github.io/stryker-mutator/stryker-karma-runner/commit/16724af))
* **package.json:** Upgrade to TypeScript 2.1 (#13) ([31a291f](https://github.io/stryker-mutator/stryker-karma-runner/commit/31a291f))
* **read-karma-config:** Use karma configuration (#10) ([d466abb](https://github.io/stryker-mutator/stryker-karma-runner/commit/d466abb))
* **stop-karma:** Stop karma on dispose (#11) ([05545eb](https://github.io/stryker-mutator/stryker-karma-runner/commit/05545eb))



<a name="0.3.2"></a>
## [0.3.2](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.3.1...v0.3.2) (2016-12-14)


### Features

* **es2015-promise:** Remove dep to es6-promise (#9) ([c64ed08](https://github.io/stryker-mutator/stryker-karma-runner/commit/c64ed08))



<a name="0.3.1"></a>
## [0.3.1](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.2.2...v0.3.1) (2016-11-20)


### Features

* **one-pass-coverage:** Enable one pass coverage (#6) ([6a9fa98](https://github.io/stryker-mutator/stryker-karma-runner/commit/6a9fa98))
* **test-runner:** Allow for big coverage objects ([661c46b](https://github.io/stryker-mutator/stryker-karma-runner/commit/661c46b))



<a name="0.2.2"></a>
## [0.2.2](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.2.1...v0.2.2) (2016-10-03)


### Bug Fixes

* **deps:** Update stryker-api version ([559c77c](https://github.io/stryker-mutator/stryker-karma-runner/commit/559c77c))


### Features

* **ts2.0:** Migrate to typescript 2.0 (#5) ([8f206bd](https://github.io/stryker-mutator/stryker-karma-runner/commit/8f206bd))



<a name="0.2.1"></a>
## [0.2.1](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.2.0...v0.2.1) (2016-08-30)


### Features

* **testFramework:** Use test framework (#3) ([9c7a750](https://github.io/stryker-mutator/stryker-karma-runner/commit/9c7a750))



<a name="0.2.0"></a>
# [0.2.0](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.1.0...v0.2.0) (2016-07-21)


### Bug Fixes

* **deps:** Add support for karma ^1.1.1 ([3e46c22](https://github.io/stryker-mutator/stryker-karma-runner/commit/3e46c22))


### Features

* **life-cycle:** Add init lifecycle event. ([985739d](https://github.io/stryker-mutator/stryker-karma-runner/commit/985739d))
* **unincluded-files:** Unincluded files support ([ef80460](https://github.io/stryker-mutator/stryker-karma-runner/commit/ef80460))



<a name="0.1.0"></a>
# [0.1.0](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.0.1...v0.1.0) (2016-07-01)


### Bug Fixes

* **deps:** Update stryker-api version ([ceb60e6](https://github.io/stryker-mutator/stryker-karma-runner/commit/ceb60e6))



<a name="0.0.1"></a>
## 0.0.1 (2016-06-29)
