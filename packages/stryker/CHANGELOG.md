# Change Log

All notable changes to this project will be documented in this file.
See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.6.6"></a>
## [0.6.6](https://github.com/stryker-mutator/stryker/compare/stryker@0.6.4...stryker@0.6.6) (2017-06-16)


### Bug Fixes

* **npmignore:** Align npm ignores (#321) ([db2a56e](https://github.com/stryker-mutator/stryker/commit/db2a56e))
* Manual version bump ([a67d90b](https://github.com/stryker-mutator/stryker/commit/a67d90b))




<a name="0.6.3"></a>
## [0.6.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.6.2...stryker@0.6.3) (2017-06-08)


### Bug Fixes

* **intializer:** Remove install of `stryker` itself (#317) ([8b8dd30](https://github.com/stryker-mutator/stryker/commit/8b8dd30)), closes [#316](https://github.com/stryker-mutator/stryker/issues/316)
* **MethodChainMutatorSpec:** Fix test name, so it matches the name of the mutator. (#313) ([5e53982](https://github.com/stryker-mutator/stryker/commit/5e53982)), closes [#313](https://github.com/stryker-mutator/stryker/issues/313)




<a name="0.6.3"></a>
## 0.6.3 (2017-06-02)


### Features

* **Mutators:** Add Boolean substitution mutators (#294) ([a137a97](https://github.com/stryker-mutator/stryker/commit/a137a97))
* **report-score-result:** Report score result as tree (#309) ([965c575](https://github.com/stryker-mutator/stryker/commit/965c575))

<a name="0.6.0"></a>
# 0.6.0 (2017-04-21)


### Bug Fixes

* **IsolatedTestRunnerAdapter:** Don't kill processes using SIGKILL (#270) ([f606e9d](https://github.com/stryker-mutator/stryker/commit/f606e9d))
* **IsolatedTestRunnerAdapter:** Improve error handling when test runner worker process crashes (#285) ([2b4bda7](https://github.com/stryker-mutator/stryker/commit/2b4bda7))


### Features

* **multi-package:** Migrate to multi-package repo (#257) ([0c2fde5](https://github.com/stryker-mutator/stryker/commit/0c2fde5))




<a name="0.5.9"></a>
## [0.5.9](https://github.com/stryker-mutator/stryker/compare/v0.5.8...v0.5.9) (2017-03-01)


### Bug Fixes

* **fileUtilsSpec:** Fix test naming ([#240](https://github.com/stryker-mutator/stryker/issues/240)) ([f1321be](https://github.com/stryker-mutator/stryker/commit/f1321be))
* **IsolatedTestRunner:** Fix channel closed error ([#219](https://github.com/stryker-mutator/stryker/issues/219)) ([202d4b5](https://github.com/stryker-mutator/stryker/commit/202d4b5))



<a name="0.5.8"></a>
## [0.5.8](https://github.com/stryker-mutator/stryker/compare/v0.5.7...v0.5.8) (2017-02-03)


### Bug Fixes

* **bin/stryker:** Changed file permissions on stryker so it's executable on Linux ([#226](https://github.com/stryker-mutator/stryker/issues/226)) ([c1a5798](https://github.com/stryker-mutator/stryker/commit/c1a5798))
* **fs:** Use graceful-fs instead of fs directly ([#221](https://github.com/stryker-mutator/stryker/issues/221)) ([4c1bf41](https://github.com/stryker-mutator/stryker/commit/4c1bf41))
* **typo:** change not coverage to no coverage ([f2c7198](https://github.com/stryker-mutator/stryker/commit/f2c7198))


### Features

* **ArrayDeclarationMutator:** Add new mutator. ([#229](https://github.com/stryker-mutator/stryker/issues/229)) ([9805917](https://github.com/stryker-mutator/stryker/commit/9805917))



<a name="0.5.7"></a>
## [0.5.7](https://github.com/stryker-mutator/stryker/compare/v0.5.6...v0.5.7) (2017-01-16)


### Features

* **append-only-progress:** Implement new reporter ([#213](https://github.com/stryker-mutator/stryker/issues/213)) ([7b68506](https://github.com/stryker-mutator/stryker/commit/7b68506))



<a name="0.5.6"></a>
## [0.5.6](https://github.com/stryker-mutator/stryker/compare/v0.5.5...v0.5.6) (2016-12-31)


### Bug Fixes

* **InputFileResolver:** Don't ignore all files ([#210](https://github.com/stryker-mutator/stryker/issues/210)) ([ef3dde4](https://github.com/stryker-mutator/stryker/commit/ef3dde4))



<a name="0.5.5"></a>
## [0.5.5](https://github.com/stryker-mutator/stryker/compare/v0.5.4...v0.5.5) (2016-12-30)


### Features

* **ClearTextReporter:** Limit the number of tests ([142de71](https://github.com/stryker-mutator/stryker/commit/142de71))
* **ConfigReader:** Look for stryker.conf.js in the CWD ([#209](https://github.com/stryker-mutator/stryker/issues/209)) ([d196fd3](https://github.com/stryker-mutator/stryker/commit/d196fd3))
* **InputfileResolver:** exclude online files from globbing ([#194](https://github.com/stryker-mutator/stryker/issues/194)) ([a114594](https://github.com/stryker-mutator/stryker/commit/a114594))
* **lifetime-support:** Remove 0.12 node support ([38f72ae](https://github.com/stryker-mutator/stryker/commit/38f72ae))
* **progress-reporter:** Create new progress reporter ([#202](https://github.com/stryker-mutator/stryker/issues/202)) ([11c345e](https://github.com/stryker-mutator/stryker/commit/11c345e))
* **ProgressReporter:** add new line after report ([#193](https://github.com/stryker-mutator/stryker/issues/193)) ([931c35f](https://github.com/stryker-mutator/stryker/commit/931c35f))
* **ts21:** Upgrade to TypeScript 2.1 ([#203](https://github.com/stryker-mutator/stryker/issues/203)) ([4ce1d16](https://github.com/stryker-mutator/stryker/commit/4ce1d16))



<a name="0.5.4"></a>
## [0.5.4](https://github.com/stryker-mutator/stryker/compare/v0.5.3...v0.5.4) (2016-12-15)


### Features

* **es2015-promise:** Remove dep to es6-promise ([#189](https://github.com/stryker-mutator/stryker/issues/189)) ([3a34fe1](https://github.com/stryker-mutator/stryker/commit/3a34fe1))
* **exclude-files:** Exclude files with a `!` ([#188](https://github.com/stryker-mutator/stryker/issues/188)) ([05a356d](https://github.com/stryker-mutator/stryker/commit/05a356d))
* **sandbox:** Change cwd in `Sandbox`es ([#187](https://github.com/stryker-mutator/stryker/issues/187)) ([28e1e5d](https://github.com/stryker-mutator/stryker/commit/28e1e5d))



<a name="0.5.3"></a>
## [0.5.3](https://github.com/stryker-mutator/stryker/compare/v0.5.2...v0.5.3) (2016-11-26)


### Features

* **test-runner:** Config for `maxConcurrentTestRunners` ([492bb80](https://github.com/stryker-mutator/stryker/commit/492bb80))



<a name="0.5.2"></a>
## [0.5.2](https://github.com/stryker-mutator/stryker/compare/v0.5.1...v0.5.2) (2016-11-21)


### Bug Fixes

* **coverage:** Make 'perTest' work with dry-run ([d700f20](https://github.com/stryker-mutator/stryker/commit/d700f20))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/stryker-mutator/stryker/compare/v0.5.0...v0.5.1) (2016-11-20)


### Bug Fixes

* **.npmignore:** Add temp folder to npm ignore ([07d1406](https://github.com/stryker-mutator/stryker/commit/07d1406))
* **istanbul:** Add dependency to istanbul ([729d770](https://github.com/stryker-mutator/stryker/commit/729d770))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/stryker-mutator/stryker/compare/v0.4.5...v0.5.0) (2016-11-20)


### Bug Fixes

* **clear-text-reporter:** Fix a typo ([0e009dc](https://github.com/stryker-mutator/stryker/commit/0e009dc))


### Features

* **cli:** Add support for commands ([#181](https://github.com/stryker-mutator/stryker/issues/181)) ([fd824de](https://github.com/stryker-mutator/stryker/commit/fd824de))
* **one-pass-coverage:** Support one-pass coverage measurement ([#165](https://github.com/stryker-mutator/stryker/issues/165)) ([1796c93](https://github.com/stryker-mutator/stryker/commit/1796c93))



<a name="0.4.5"></a>
## [0.4.5](https://github.com/stryker-mutator/stryker/compare/v0.4.4...v0.4.5) (2016-10-29)


### Bug Fixes

* **BlockStatementMutator:** Not mutate empty block ([#160](https://github.com/stryker-mutator/stryker/issues/160)) ([da4a3cf](https://github.com/stryker-mutator/stryker/commit/da4a3cf))
* **stryker:** Stop running if there are no mutants ([#161](https://github.com/stryker-mutator/stryker/issues/161)) ([8f68da8](https://github.com/stryker-mutator/stryker/commit/8f68da8))



<a name="0.4.4"></a>
## [0.4.4](https://github.com/stryker-mutator/stryker/compare/v0.4.3...v0.4.4) (2016-10-04)


### Bug Fixes

* **line-endings:** Enforce unix line endings ([#152](https://github.com/stryker-mutator/stryker/issues/152)) ([554c167](https://github.com/stryker-mutator/stryker/commit/554c167))
* **MutantRunResultMatcher:** False positive fix ([#155](https://github.com/stryker-mutator/stryker/issues/155)) ([255f84b](https://github.com/stryker-mutator/stryker/commit/255f84b)), closes [#155](https://github.com/stryker-mutator/stryker/issues/155)


### Features

* **ts2.0:** Migrate to typescript 2.0 ([#154](https://github.com/stryker-mutator/stryker/issues/154)) ([1c5db5c](https://github.com/stryker-mutator/stryker/commit/1c5db5c))



<a name="0.4.3"></a>
## [0.4.3](https://github.com/stryker-mutator/stryker/compare/v0.1.0...v0.4.3) (2016-09-09)


### Bug Fixes

* **bithound:** Add bithoundrc with tslint engine ([#117](https://github.com/stryker-mutator/stryker/issues/117)) ([3b7e9f9](https://github.com/stryker-mutator/stryker/commit/3b7e9f9))
* **deps:** Set version of stryker-api ([338d8ec](https://github.com/stryker-mutator/stryker/commit/338d8ec))
* **isolated-test-runner:** Support regexes ([#146](https://github.com/stryker-mutator/stryker/issues/146)) ([51b6903](https://github.com/stryker-mutator/stryker/commit/51b6903))
* **log4jsMock:** Restore sandbox in log4js mock ([#122](https://github.com/stryker-mutator/stryker/issues/122)) ([4a88b58](https://github.com/stryker-mutator/stryker/commit/4a88b58))
* **parserUtils:** Add support for duplicate ast ([#119](https://github.com/stryker-mutator/stryker/issues/119)) ([b35e223](https://github.com/stryker-mutator/stryker/commit/b35e223))
* **StrykerTempFolder:** Use local tmp folder ([#121](https://github.com/stryker-mutator/stryker/issues/121)) ([53651b2](https://github.com/stryker-mutator/stryker/commit/53651b2))
* **test-deps:** Set version of stryker-api in it ([a094e4b](https://github.com/stryker-mutator/stryker/commit/a094e4b))
* **TestRunnerOrchestrator:** Error in test run ([#120](https://github.com/stryker-mutator/stryker/issues/120)) ([b03e84b](https://github.com/stryker-mutator/stryker/commit/b03e84b))
* **TestRunnerOrchestrator:** Initial test run ([#130](https://github.com/stryker-mutator/stryker/issues/130)) ([a3c8902](https://github.com/stryker-mutator/stryker/commit/a3c8902))
* **unittest:** Fix merge error in TestRunnerOrchestratorSpec ([1f6a05a](https://github.com/stryker-mutator/stryker/commit/1f6a05a))


### Features

* **test-runner:** Support lifecycle events ([#125](https://github.com/stryker-mutator/stryker/issues/125)) ([8aca3bd](https://github.com/stryker-mutator/stryker/commit/8aca3bd))
* **test-runner:** Support lifecycle events ([#132](https://github.com/stryker-mutator/stryker/issues/132)) ([0675864](https://github.com/stryker-mutator/stryker/commit/0675864))
* **unincluded-files:** Add support for unincluded ([#126](https://github.com/stryker-mutator/stryker/issues/126)) ([916ae55](https://github.com/stryker-mutator/stryker/commit/916ae55))



<a name="0.4.2"></a>
## [0.4.2](https://github.com/stryker-mutator/stryker/compare/v0.1.0...v0.4.2) (2016-08-09)


### Bug Fixes

* **bithound:** Add bithoundrc with tslint engine ([#117](https://github.com/stryker-mutator/stryker/issues/117)) ([3b7e9f9](https://github.com/stryker-mutator/stryker/commit/3b7e9f9))
* **deps:** Set version of stryker-api ([338d8ec](https://github.com/stryker-mutator/stryker/commit/338d8ec))
* **log4jsMock:** Restore sandbox in log4js mock ([#122](https://github.com/stryker-mutator/stryker/issues/122)) ([4a88b58](https://github.com/stryker-mutator/stryker/commit/4a88b58))
* **parserUtils:** Add support for duplicate ast ([#119](https://github.com/stryker-mutator/stryker/issues/119)) ([b35e223](https://github.com/stryker-mutator/stryker/commit/b35e223))
* **StrykerTempFolder:** Use local tmp folder ([#121](https://github.com/stryker-mutator/stryker/issues/121)) ([53651b2](https://github.com/stryker-mutator/stryker/commit/53651b2))
* **test-deps:** Set version of stryker-api in it ([a094e4b](https://github.com/stryker-mutator/stryker/commit/a094e4b))
* **TestRunnerOrchestrator:** Error in test run ([#120](https://github.com/stryker-mutator/stryker/issues/120)) ([b03e84b](https://github.com/stryker-mutator/stryker/commit/b03e84b))
* **TestRunnerOrchestrator:** Initial test run ([#130](https://github.com/stryker-mutator/stryker/issues/130)) ([a3c8902](https://github.com/stryker-mutator/stryker/commit/a3c8902))
* **unittest:** Fix merge error in TestRunnerOrchestratorSpec ([1f6a05a](https://github.com/stryker-mutator/stryker/commit/1f6a05a))


### Features

* **test-runner:** Support lifecycle events ([#125](https://github.com/stryker-mutator/stryker/issues/125)) ([8aca3bd](https://github.com/stryker-mutator/stryker/commit/8aca3bd))
* **test-runner:** Support lifecycle events ([#132](https://github.com/stryker-mutator/stryker/issues/132)) ([0675864](https://github.com/stryker-mutator/stryker/commit/0675864))
* **unincluded-files:** Add support for unincluded ([#126](https://github.com/stryker-mutator/stryker/issues/126)) ([916ae55](https://github.com/stryker-mutator/stryker/commit/916ae55))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/stryker-mutator/stryker/compare/v0.4.0...v0.4.1) (2016-07-22)


### Features

* **test-runner:** Support lifecycle events ([#132](https://github.com/stryker-mutator/stryker/issues/132)) ([bea5f11](https://github.com/stryker-mutator/stryker/commit/bea5f11))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/stryker-mutator/stryker/compare/v0.3.2...v0.4.0) (2016-07-21)


### Bug Fixes

* **bithound:** Add bithoundrc with tslint engine ([#117](https://github.com/stryker-mutator/stryker/issues/117)) ([60191e3](https://github.com/stryker-mutator/stryker/commit/60191e3))
* **deps:** Set version of stryker-api ([aa51dc1](https://github.com/stryker-mutator/stryker/commit/aa51dc1))
* **log4jsMock:** Restore sandbox in log4js mock ([#122](https://github.com/stryker-mutator/stryker/issues/122)) ([e3f3ce1](https://github.com/stryker-mutator/stryker/commit/e3f3ce1))
* **parserUtils:** Add support for duplicate ast ([#119](https://github.com/stryker-mutator/stryker/issues/119)) ([f7eda47](https://github.com/stryker-mutator/stryker/commit/f7eda47))
* **StrykerTempFolder:** Use local tmp folder ([#121](https://github.com/stryker-mutator/stryker/issues/121)) ([84790f2](https://github.com/stryker-mutator/stryker/commit/84790f2))
* **test-deps:** Set version of stryker-api in it ([e006ade](https://github.com/stryker-mutator/stryker/commit/e006ade))
* **TestRunnerOrchestrator:** Error in test run ([#120](https://github.com/stryker-mutator/stryker/issues/120)) ([564f15c](https://github.com/stryker-mutator/stryker/commit/564f15c))
* **TestRunnerOrchestrator:** Initial test run ([#130](https://github.com/stryker-mutator/stryker/issues/130)) ([7f0b26a](https://github.com/stryker-mutator/stryker/commit/7f0b26a))
* **unittest:** Fix merge error in TestRunnerOrchestratorSpec ([55afd5e](https://github.com/stryker-mutator/stryker/commit/55afd5e))


### Features

* **test-runner:** Support lifecycle events ([#125](https://github.com/stryker-mutator/stryker/issues/125)) ([6c0e229](https://github.com/stryker-mutator/stryker/commit/6c0e229))
* **unincluded-files:** Add support for unincluded ([#126](https://github.com/stryker-mutator/stryker/issues/126)) ([c66e380](https://github.com/stryker-mutator/stryker/commit/c66e380))



<a name="0.3.2"></a>
## [0.3.2](https://github.com/stryker-mutator/stryker/compare/v0.3.1...v0.3.2) (2016-04-28)



<a name="0.3.1"></a>
## [0.3.1](https://github.com/stryker-mutator/stryker/compare/v0.2.1...v0.3.1) (2016-04-17)



<a name="0.2.1"></a>
## [0.2.1](https://github.com/stryker-mutator/stryker/compare/v0.2.0...v0.2.1) (2016-04-14)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/stryker-mutator/stryker/compare/v0.1.0...v0.2.0) (2016-04-08)



<a name="0.1.0"></a>
# [0.1.0](https://github.com/stryker-mutator/stryker/compare/v0.0.0...v0.1.0) (2016-03-24)
