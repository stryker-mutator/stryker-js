# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.17.3"></a>
## [0.17.3](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.17.2...stryker-api@0.17.3) (2018-07-04)




**Note:** Version bump only for package stryker-api

<a name="0.17.2"></a>
## [0.17.2](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.17.1...stryker-api@0.17.2) (2018-05-31)




**Note:** Version bump only for package stryker-api

<a name="0.17.1"></a>
## [0.17.1](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.17.0...stryker-api@0.17.1) (2018-05-21)




**Note:** Version bump only for package stryker-api

<a name="0.17.0"></a>
# [0.17.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.16.1...stryker-api@0.17.0) (2018-04-30)


### Features

* **node version:** drop node 4 support ([#724](https://github.com/stryker-mutator/stryker/issues/724)) ([a038931](https://github.com/stryker-mutator/stryker/commit/a038931))


### BREAKING CHANGES

* **node version:** Node 4 is no longer supported.




<a name="0.16.1"></a>
## [0.16.1](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.16.0...stryker-api@0.16.1) (2018-04-20)




**Note:** Version bump only for package stryker-api

<a name="0.16.0"></a>
# [0.16.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.15.0...stryker-api@0.16.0) (2018-04-11)


### Features

* **Sandbox isolation:** symbolic link node_modules in sandboxes ([#689](https://github.com/stryker-mutator/stryker/issues/689)) ([487ab7c](https://github.com/stryker-mutator/stryker/commit/487ab7c))




<a name="0.15.0"></a>
# [0.15.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.14.0...stryker-api@0.15.0) (2018-04-04)


### Features

* **Detect files:** create `File` class ([1a89c10](https://github.com/stryker-mutator/stryker/commit/1a89c10))
* **test runner:** add hooks file to test run api ([97be399](https://github.com/stryker-mutator/stryker/commit/97be399))
* **Transpiler api:** change return type of `transpile` to a file array ([e713416](https://github.com/stryker-mutator/stryker/commit/e713416))


### BREAKING CHANGES

* **test runner:** * Promises return types should be `Promise<void>` instead
of `Promise<any>` (typescript compiler error).
* **Detect files:** Remove the `InputFileDescriptor`
interface (breaking for typescript compiler)




<a name="0.14.0"></a>
# [0.14.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.13.1...stryker-api@0.14.0) (2018-03-22)


### Features

* **stryker:** add excludedMutations as a config option ([#13](https://github.com/stryker-mutator/stryker/issues/13)) ([#652](https://github.com/stryker-mutator/stryker/issues/652)) ([cc8a5f1](https://github.com/stryker-mutator/stryker/commit/cc8a5f1))




<a name="0.13.1"></a>
## [0.13.1](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.13.0...stryker-api@0.13.1) (2018-03-21)




**Note:** Version bump only for package stryker-api

<a name="0.13.0"></a>
# [0.13.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.12.0...stryker-api@0.13.0) (2018-02-07)


### Features

* **coverage analysis:** Support transpiled code ([#559](https://github.com/stryker-mutator/stryker/issues/559)) ([7c351ad](https://github.com/stryker-mutator/stryker/commit/7c351ad))




<a name="0.12.0"></a>
# 0.12.0 (2017-12-21)


### Features

* **cvg analysis:** New coverage instrumenter ([#550](https://github.com/stryker-mutator/stryker/issues/550)) ([2bef577](https://github.com/stryker-mutator/stryker/commit/2bef577))
* **typescript:** Add version check ([#449](https://github.com/stryker-mutator/stryker/issues/449)) ([a780189](https://github.com/stryker-mutator/stryker/commit/a780189)), closes [#437](https://github.com/stryker-mutator/stryker/issues/437)




<a name="0.11.0"></a>
# [0.11.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.10.0...stryker-api@0.11.0) (2017-10-24)


### Features

* **transpiler api:** Async transpiler plugin support ([#433](https://github.com/stryker-mutator/stryker/issues/433)) ([794e587](https://github.com/stryker-mutator/stryker/commit/794e587))




<a name="0.10.0"></a>
## [0.10.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.9.0...stryker-api@0.10.0) (2017-10-20)


### Bug Fixes

* **mocha framework:** Select tests based on name ([#413](https://github.com/stryker-mutator/stryker/issues/413)) ([bb7c02f](https://github.com/stryker-mutator/stryker/commit/bb7c02f)), closes [#249](https://github.com/stryker-mutator/stryker/issues/249)


### BREAKING CHANGES

* **mocha framework:** * Change api of `TestFramework`. It now provides an array of `TestSelection` objects, instead of an array of numbers with test ids.




<a name="0.9.0"></a>
# [0.9.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.8.0...stryker-api@0.9.0) (2017-09-19)


### Features

* **typescript:** Add support for TypeScript mutation testing (#376) ([ba78168](https://github.com/stryker-mutator/stryker/commit/ba78168))


### BREAKING CHANGES

* **typescript:** * Hoist the `Mutator` interface to a higher abstraction. With this interface it was possible to add mutators for specific ES5 AST nodes. As we're moving away from ES5, this plugin abstraction had to be hoisted to a higher level. It is no longer possible to plugin a specific ES5 node mutator.
* Update `report` interface: Rename `MutantState.Error` => `MutantState.RuntimeError`. 




<a name="0.8.0"></a>
# [0.8.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.7.0...stryker-api@0.8.0) (2017-08-25)


### Code Refactoring

* change ConfigWriter interface name to ConfigEditor (#357) ([ec4ae03](https://github.com/stryker-mutator/stryker/commit/ec4ae03))


### BREAKING CHANGES

* Public api for `ConfigWriter` is renamed to `ConfigEditor`. The corresponding `write` method is renamed to `edit`. If you're using custom `ConfigWriter` plugins you should rename the `write` method to `edit`. Please update the `stryker-mocha-framework` and `stryker-karma-runner` to the latest versions as they provide the new `ConfigEditor` plugin.




<a name="0.7.0"></a>
# [0.7.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.6.0...stryker-api@0.7.0) (2017-08-11)


### Features

* **ci-integration:** Configurable thresholds based on mutation score (#355) ([93f28cc](https://github.com/stryker-mutator/stryker/commit/93f28cc)), closes [#220](https://github.com/stryker-mutator/stryker/issues/220)




<a name="0.6.0"></a>
# [0.6.0](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.5.6...stryker-api@0.6.0) (2017-08-04)


### Features

* **html-reporter:** Score result as single source of truth (#341) ([47b3295](https://github.com/stryker-mutator/stryker/commit/47b3295)), closes [#335](https://github.com/stryker-mutator/stryker/issues/335)




<a name="0.5.6"></a>
## [0.5.6](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.5.5...stryker-api@0.5.6) (2017-07-14)


### Bug Fixes

* **ts-2.4:** Fix type issues for typescript 2.4 (#337) ([c18079b](https://github.com/stryker-mutator/stryker/commit/c18079b)), closes [#337](https://github.com/stryker-mutator/stryker/issues/337)




<a name="0.5.5"></a>
## [0.5.5](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.5.3...stryker-api@0.5.5) (2017-06-16)


### Bug Fixes

* **npmignore:** Align npm ignores (#321) ([db2a56e](https://github.com/stryker-mutator/stryker/commit/db2a56e))
* Manual version bump ([a67d90b](https://github.com/stryker-mutator/stryker/commit/a67d90b))




<a name="0.5.2"></a>
## [0.5.2](https://github.com/stryker-mutator/stryker/compare/stryker-api@0.5.1...stryker-api@0.5.2) (2017-06-08)




<a name="0.5.1"></a>
## 0.5.1 (2017-06-02)

### Features

* **report-score-result:** Report score result as tree (#309) ([965c575](https://github.com/stryker-mutator/stryker/commit/965c575))

<a name="0.5.0"></a>
# 0.5.0 (2017-04-21)


### Bug Fixes

* **package.json:** Use stryker repo url (#266) ([de7d1cd](https://github.com/stryker-mutator/stryker/commit/de7d1cd))


### Features

* **multi-package:** Migrate to multi-package repo (#257) ([0c2fde5](https://github.com/stryker-mutator/stryker/commit/0c2fde5))




<a name="0.4.2"></a>
## [0.4.2](https://github.com/stryker-mutator/stryker-api/compare/v0.4.1...v0.4.2) (2016-12-30)


### Bug Fixes

* **config:** Update `files` array type ([#12](https://github.com/stryker-mutator/stryker-api/issues/12)) ([9874730](https://github.com/stryker-mutator/stryker-api/commit/9874730))


### Features

* **report:** Report matched mutants ([#13](https://github.com/stryker-mutator/stryker-api/issues/13)) ([b0e2f6a](https://github.com/stryker-mutator/stryker-api/commit/b0e2f6a))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/stryker-mutator/stryker-api/compare/v0.4.0...v0.4.1) (2016-11-30)


### Features

* **es2015-promise:** Remove dep to es6-promise ([#11](https://github.com/stryker-mutator/stryker-api/issues/11)) ([7042381](https://github.com/stryker-mutator/stryker-api/commit/7042381))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/stryker-mutator/stryker-api/compare/v0.2.1...v0.4.0) (2016-11-20)


### Features

* **configurable-concurrency:** Add setting for maxConcurrentTestRunners ([731a05b](https://github.com/stryker-mutator/stryker-api/commit/731a05b))
* **configurable-concurrency:** Default value ([32abab2](https://github.com/stryker-mutator/stryker-api/commit/32abab2))
* **mutant-status:** Add `Error` to `MutantStatus` ([#7](https://github.com/stryker-mutator/stryker-api/issues/7)) ([e9df479](https://github.com/stryker-mutator/stryker-api/commit/e9df479))
* **new-api:** Allow for one-pass coverage/test ([#6](https://github.com/stryker-mutator/stryker-api/issues/6)) ([d42c3c7](https://github.com/stryker-mutator/stryker-api/commit/d42c3c7))




<a name="0.2.1"></a>
## 0.2.1 (2016-10-03)

* 0.2.1 ([109d01e](https://github.com/stryker-mutator/stryker-api/commit/109d01e))
* fix(version): Reset version back to 0.2.0 ([50bceb8](https://github.com/stryker-mutator/stryker-api/commit/50bceb8))



<a name="0.3.0-0"></a>
# 0.3.0-0 (2016-09-30)

* 0.3.0-0 ([e73cbba](https://github.com/stryker-mutator/stryker-api/commit/e73cbba))
* feat(ts-2): Upgrade to typescript 2 (#5) ([88a4254](https://github.com/stryker-mutator/stryker-api/commit/88a4254))



<a name="0.2.0"></a>
# 0.2.0 (2016-07-21)

* 0.2.0 ([3410831](https://github.com/stryker-mutator/stryker-api/commit/3410831))
* docs(readme): Add mutator to the list of extensions ([7cef4bd](https://github.com/stryker-mutator/stryker-api/commit/7cef4bd))



<a name="0.1.2"></a>
## 0.1.2 (2016-07-18)

* 0.1.2 ([52f330c](https://github.com/stryker-mutator/stryker-api/commit/52f330c))
* feat(include-comments): Include comments in d-ts files (#2) ([0d2279e](https://github.com/stryker-mutator/stryker-api/commit/0d2279e))
* feat(unincluded-files): Add `include` boolean (#3) ([32d7cdf](https://github.com/stryker-mutator/stryker-api/commit/32d7cdf))



<a name="0.1.1"></a>
## 0.1.1 (2016-07-15)

* 0.1.1 ([e5f039d](https://github.com/stryker-mutator/stryker-api/commit/e5f039d))
* feat(testRunner): Add lifecycle events. (#1) ([94e61c7](https://github.com/stryker-mutator/stryker-api/commit/94e61c7))



<a name="0.1.0"></a>
# 0.1.0 (2016-07-01)

* 0.0.3 ([af5864e](https://github.com/stryker-mutator/stryker-api/commit/af5864e))
* 0.1.0 ([1530de2](https://github.com/stryker-mutator/stryker-api/commit/1530de2))
* docs(readme.md) Update markup ([18f4907](https://github.com/stryker-mutator/stryker-api/commit/18f4907))
* feat(testSelector) Add test selector option to stryker ([79952c3](https://github.com/stryker-mutator/stryker-api/commit/79952c3))



<a name="0.0.2"></a>
## 0.0.2 (2016-06-09)

* docs(build) Add travis build file ([6a7acdb](https://github.com/stryker-mutator/stryker-api/commit/6a7acdb))
* docs(readme) Add stryker logo ([66d45db](https://github.com/stryker-mutator/stryker-api/commit/66d45db))
* fix(TestRunner) Replace TestRunner base class with interface ([8507b89](https://github.com/stryker-mutator/stryker-api/commit/8507b89))
* Initial commit - Basic copy from stryker-mutator/stryker ([e9818e5](https://github.com/stryker-mutator/stryker-api/commit/e9818e5))
* Initial version of the stryker-api ([f7bb9c2](https://github.com/stryker-mutator/stryker-api/commit/f7bb9c2))
* refactor(Factory) Fix typo in error message ([70eec6c](https://github.com/stryker-mutator/stryker-api/commit/70eec6c))
* refactor(package.json) Remove unused dependencies ([b9ba1a4](https://github.com/stryker-mutator/stryker-api/commit/b9ba1a4))
* refactor(report) Rename spec to test as it is more logical in the context of a test report. ([9396c98](https://github.com/stryker-mutator/stryker-api/commit/9396c98))
* test(integration) Add a lot of integration tests ([ed24290](https://github.com/stryker-mutator/stryker-api/commit/ed24290))
