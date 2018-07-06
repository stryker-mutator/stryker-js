# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.24.2"></a>
## [0.24.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.24.1...stryker@0.24.2) (2018-07-04)


### Bug Fixes

* **stryker:** kill entire test process tree ([#927](https://github.com/stryker-mutator/stryker/issues/927)) ([71af3e3](https://github.com/stryker-mutator/stryker/commit/71af3e3))




<a name="0.24.1"></a>
## [0.24.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.24.0...stryker@0.24.1) (2018-05-31)


### Bug Fixes

* **Peer dep:** set correct stryker-api peer dependency ([#830](https://github.com/stryker-mutator/stryker/issues/830)) ([af973a1](https://github.com/stryker-mutator/stryker/commit/af973a1))




<a name="0.24.0"></a>
# [0.24.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.23.0...stryker@0.24.0) (2018-05-21)


### Features

* **Dashboard reporter:** add support for CircleCI ([a58afff](https://github.com/stryker-mutator/stryker/commit/a58afff))




<a name="0.23.0"></a>
# [0.23.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.22.4...stryker@0.23.0) (2018-04-30)


### Features

* **node version:** drop node 4 support ([#724](https://github.com/stryker-mutator/stryker/issues/724)) ([a038931](https://github.com/stryker-mutator/stryker/commit/a038931))


### BREAKING CHANGES

* **node version:** Node 4 is no longer supported.




<a name="0.22.4"></a>
## [0.22.4](https://github.com/stryker-mutator/stryker/compare/stryker@0.22.3...stryker@0.22.4) (2018-04-20)


### Bug Fixes

* **Sandbox:** make sure .stryker-tmp does not appear in the sandbox ([#716](https://github.com/stryker-mutator/stryker/issues/716)) ([48acc2c](https://github.com/stryker-mutator/stryker/commit/48acc2c)), closes [#698](https://github.com/stryker-mutator/stryker/issues/698)




<a name="0.22.3"></a>
## [0.22.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.22.2...stryker@0.22.3) (2018-04-20)


### Bug Fixes

* **Sandbox pool:** remove race condition ([#714](https://github.com/stryker-mutator/stryker/issues/714)) ([a3606d8](https://github.com/stryker-mutator/stryker/commit/a3606d8)), closes [#713](https://github.com/stryker-mutator/stryker/issues/713)




<a name="0.22.2"></a>
## [0.22.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.22.1...stryker@0.22.2) (2018-04-20)




**Note:** Version bump only for package stryker

<a name="0.22.1"></a>
## [0.22.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.22.0...stryker@0.22.1) (2018-04-13)


### Bug Fixes

* **Dependencies:** set correct stryker-api dependency ([#694](https://github.com/stryker-mutator/stryker/issues/694)) ([e333fd9](https://github.com/stryker-mutator/stryker/commit/e333fd9))




<a name="0.22.0"></a>
# [0.22.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.21.1...stryker@0.22.0) (2018-04-11)


### Features

* **Sandbox isolation:** symbolic link node_modules in sandboxes ([#689](https://github.com/stryker-mutator/stryker/issues/689)) ([487ab7c](https://github.com/stryker-mutator/stryker/commit/487ab7c))




<a name="0.21.1"></a>
## [0.21.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.21.0...stryker@0.21.1) (2018-04-09)


### Bug Fixes

* **Dashboard reporter:** fix typos ([047a370](https://github.com/stryker-mutator/stryker/commit/047a370))




<a name="0.21.0"></a>
# [0.21.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.20.1...stryker@0.21.0) (2018-04-04)


### Bug Fixes

* **Progress reporter:** don't prevent stryker from closing ([21255aa](https://github.com/stryker-mutator/stryker/commit/21255aa))


### Features

* **identify-files:** use git to list files in `InputFileResolver` ([df6169a](https://github.com/stryker-mutator/stryker/commit/df6169a))


### BREAKING CHANGES

* **identify-files:** * The `InputFileDescriptor` syntax for files is no longer supported.
* Test runner plugins should keep track of which files are included
into a test run and in which order.
* Transpiler plugins should keep track of which files are to be
transpiled.




<a name="0.20.1"></a>
## [0.20.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.20.0...stryker@0.20.1) (2018-03-22)


### Bug Fixes

* **peerDependency:** update stryker-api requirement to ^0.14.0 ([3ce04d4](https://github.com/stryker-mutator/stryker/commit/3ce04d4))




<a name="0.20.0"></a>
# [0.20.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.19.4...stryker@0.20.0) (2018-03-22)


### Features

* **stryker:** add excludedMutations as a config option ([#13](https://github.com/stryker-mutator/stryker/issues/13)) ([#652](https://github.com/stryker-mutator/stryker/issues/652)) ([cc8a5f1](https://github.com/stryker-mutator/stryker/commit/cc8a5f1))




<a name="0.19.4"></a>
## [0.19.4](https://github.com/stryker-mutator/stryker/compare/stryker@0.19.3...stryker@0.19.4) (2018-03-21)




**Note:** Version bump only for package stryker

<a name="0.19.3"></a>
## [0.19.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.19.2...stryker@0.19.3) (2018-02-14)


### Bug Fixes

* **coverage-analysis:** make sure to not erase sourceMappingURL comment ([#625](https://github.com/stryker-mutator/stryker/issues/625)) ([eed7147](https://github.com/stryker-mutator/stryker/commit/eed7147))




<a name="0.19.2"></a>
## [0.19.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.19.1...stryker@0.19.2) (2018-02-08)


### Bug Fixes

* **stryker:** remove import to undependant module ([0956194](https://github.com/stryker-mutator/stryker/commit/0956194))




<a name="0.19.1"></a>
## [0.19.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.19.0...stryker@0.19.1) (2018-02-07)


### Bug Fixes

* **dependencies:** update stryker-api requirement to ^0.13.0 ([8eba6d4](https://github.com/stryker-mutator/stryker/commit/8eba6d4))




<a name="0.19.0"></a>
# [0.19.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.18.2...stryker@0.19.0) (2018-02-07)


### Features

* **coverage analysis:** Support transpiled code ([#559](https://github.com/stryker-mutator/stryker/issues/559)) ([7c351ad](https://github.com/stryker-mutator/stryker/commit/7c351ad))
* **dashboard-reporter:** Add dashboard reporter ([#472](https://github.com/stryker-mutator/stryker/issues/472)) ([0693a41](https://github.com/stryker-mutator/stryker/commit/0693a41))




<a name="0.18.2"></a>
## [0.18.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.18.1...stryker@0.18.2) (2018-02-02)




**Note:** Version bump only for package stryker

<a name="0.18.1"></a>
## [0.18.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.18.0...stryker@0.18.1) (2018-01-19)




**Note:** Version bump only for package stryker

<a name="0.18.0"></a>
# [0.18.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.17.2...stryker@0.18.0) (2018-01-12)


### Features

* **Child processes:** Support process message polution ([#572](https://github.com/stryker-mutator/stryker/issues/572)) ([dbe4d84](https://github.com/stryker-mutator/stryker/commit/dbe4d84))




<a name="0.17.2"></a>
## [0.17.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.17.1...stryker@0.17.2) (2018-01-10)


### Bug Fixes

* **es5-mutator:** Describe migration for users with plugins ([6be95c3](https://github.com/stryker-mutator/stryker/commit/6be95c3))




<a name="0.17.1"></a>
## [0.17.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.17.0...stryker@0.17.1) (2018-01-10)




**Note:** Version bump only for package stryker

<a name="0.17.0"></a>
# [0.17.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.16.0...stryker@0.17.0) (2017-12-21)


### Features

* **cvg analysis:** New coverage instrumenter ([#550](https://github.com/stryker-mutator/stryker/issues/550)) ([2bef577](https://github.com/stryker-mutator/stryker/commit/2bef577))




<a name="0.16.0"></a>
# [0.16.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.15.6...stryker@0.16.0) (2017-12-19)


### Features

* **config:** [#438](https://github.com/stryker-mutator/stryker/issues/438) Extensive config validation ([#549](https://github.com/stryker-mutator/stryker/issues/549)) ([dc6fdf2](https://github.com/stryker-mutator/stryker/commit/dc6fdf2))




<a name="0.15.6"></a>
## [0.15.6](https://github.com/stryker-mutator/stryker/compare/stryker@0.15.5...stryker@0.15.6) (2017-12-18)




**Note:** Version bump only for package stryker

<a name="0.15.5"></a>
## [0.15.5](https://github.com/stryker-mutator/stryker/compare/stryker@0.15.4...stryker@0.15.5) (2017-12-05)




**Note:** Version bump only for package stryker

<a name="0.15.4"></a>
## [0.15.4](https://github.com/stryker-mutator/stryker/compare/stryker@0.15.3...stryker@0.15.4) (2017-11-27)




**Note:** Version bump only for package stryker

<a name="0.15.3"></a>
## [0.15.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.15.2...stryker@0.15.3) (2017-11-27)




**Note:** Version bump only for package stryker

<a name="0.15.2"></a>
## [0.15.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.15.1...stryker@0.15.2) (2017-11-25)


### Bug Fixes

* **StrykerSpec:** Uncomment tests ([#471](https://github.com/stryker-mutator/stryker/issues/471)) ([4a13afa](https://github.com/stryker-mutator/stryker/commit/4a13afa))




<a name="0.15.1"></a>
## [0.15.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.15.0...stryker@0.15.1) (2017-11-24)


### Bug Fixes

* **Initializer:** Remove es5 option ([#469](https://github.com/stryker-mutator/stryker/issues/469)) ([98048f4](https://github.com/stryker-mutator/stryker/commit/98048f4))




<a name="0.15.0"></a>
# [0.15.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.14.1...stryker@0.15.0) (2017-11-24)


### Features

* **JavaScript mutator:** Add stryker-javascript-mutator package ([#467](https://github.com/stryker-mutator/stryker/issues/467)) ([06d6bac](https://github.com/stryker-mutator/stryker/commit/06d6bac)), closes [#429](https://github.com/stryker-mutator/stryker/issues/429)




<a name="0.14.1"></a>
## [0.14.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.14.0...stryker@0.14.1) (2017-11-17)




**Note:** Version bump only for package stryker

<a name="0.14.0"></a>
# [0.14.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.13.0...stryker@0.14.0) (2017-11-13)


### Bug Fixes

* **InputFileResolver:** Presume .zip and .tar are binary files. ([#452](https://github.com/stryker-mutator/stryker/issues/452)) ([94f8fdc](https://github.com/stryker-mutator/stryker/commit/94f8fdc)), closes [#447](https://github.com/stryker-mutator/stryker/issues/447)


### Features

* **mocha 4:** Add support for mocha version 4 ([#455](https://github.com/stryker-mutator/stryker/issues/455)) ([de6ae4f](https://github.com/stryker-mutator/stryker/commit/de6ae4f))




<a name="0.13.0"></a>
# [0.13.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.12.0...stryker@0.13.0) (2017-10-24)


### Features

* **default score:** Set default score to 100 ([b9231fe](https://github.com/stryker-mutator/stryker/commit/b9231fe))
* **transpiler api:** Async transpiler plugin support ([#433](https://github.com/stryker-mutator/stryker/issues/433)) ([794e587](https://github.com/stryker-mutator/stryker/commit/794e587))




<a name="0.12.0"></a>
## [0.12.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.11.2...stryker@0.12.0) (2017-10-20)


### Bug Fixes

* **mocha framework:** Select tests based on name ([#413](https://github.com/stryker-mutator/stryker/issues/413)) ([bb7c02f](https://github.com/stryker-mutator/stryker/commit/bb7c02f)), closes [#249](https://github.com/stryker-mutator/stryker/issues/249)


### BREAKING CHANGES

* **mocha framework:** * Change api of `TestFramework`. It now provides an array of `TestSelection` objects, instead of an array of numbers with test ids.




<a name="0.11.2"></a>
## [0.11.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.11.1...stryker@0.11.2) (2017-10-11)


### Bug Fixes

* **deps:** Remove types for prettier as a dev ([7014322](https://github.com/stryker-mutator/stryker/commit/7014322))




<a name="0.11.1"></a>
## [0.11.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.11.0...stryker@0.11.1) (2017-10-10)




**Note:** Version bump only for package stryker

<a name="0.11.0"></a>
# [0.11.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.10.3...stryker@0.11.0) (2017-10-03)


### Bug Fixes

* **progress reporter:** Simpify reported progress ([#401](https://github.com/stryker-mutator/stryker/issues/401)) ([6258ef1](https://github.com/stryker-mutator/stryker/commit/6258ef1)), closes [#400](https://github.com/stryker-mutator/stryker/issues/400)
* **sandbox:** Prevent hanging child processes ([#402](https://github.com/stryker-mutator/stryker/issues/402)) ([ff6962a](https://github.com/stryker-mutator/stryker/commit/ff6962a)), closes [#396](https://github.com/stryker-mutator/stryker/issues/396)


### Features

* **ConfigReader:** Use CLI options with default config file ([#404](https://github.com/stryker-mutator/stryker/issues/404)) ([99cdc61](https://github.com/stryker-mutator/stryker/commit/99cdc61)), closes [#390](https://github.com/stryker-mutator/stryker/issues/390)
* **StrykerInitializer:** Add the option to select mutators and transpilers ([#403](https://github.com/stryker-mutator/stryker/issues/403)) ([c61786f](https://github.com/stryker-mutator/stryker/commit/c61786f))




<a name="0.10.3"></a>
## [0.10.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.10.2...stryker@0.10.3) (2017-09-22)




**Note:** Version bump only for package stryker

<a name="0.10.2"></a>
# [0.10.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.10.1...stryker@0.10.2) (2017-09-20)


### Bug Fixes

* **dependency on 'rx':** Remove requires to `'rx'` directly ([71f7330](https://github.com/stryker-mutator/stryker/commit/71f7330))
* **missing dependency:** Remove invalid package-lock file ([aeeeb7b](https://github.com/stryker-mutator/stryker/commit/aeeeb7b))
* **MutationTestExecutor:** Only complete defined observables ([#381](https://github.com/stryker-mutator/stryker/issues/381)) ([a0a1355](https://github.com/stryker-mutator/stryker/commit/a0a1355))


<a name="0.10.1"></a>
# [0.10.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.9.3...stryker@0.10.1) (2017-09-20)


### Bug Fixes

* **missing dependency:** Remove invalid package-lock file ([aeeeb7b](https://github.com/stryker-mutator/stryker/commit/aeeeb7b))

<a name="0.10.0"></a>
# [0.10.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.9.3...stryker@0.10.0) (2017-09-19)


### Features

* **typescript:** Add support for TypeScript mutation testing (#376) ([ba78168](https://github.com/stryker-mutator/stryker/commit/ba78168))


### BREAKING CHANGES

* **typescript:** * Hoist the `Mutator` interface to a higher abstraction. With this interface it was possible to add mutators for specific ES5 AST nodes. As we're moving away from ES5, this plugin abstraction had to be hoisted to a higher level. It is no longer possible to plugin a specific ES5 node mutator.
* Update `report` interface: Rename `MutantState.Error` => `MutantState.RuntimeError`. 




<a name="0.9.3"></a>
## [0.9.3](https://github.com/stryker-mutator/stryker/compare/stryker@0.9.2...stryker@0.9.3) (2017-09-09)


### Bug Fixes

* **score-result:** Wrap single file reports ([#379](https://github.com/stryker-mutator/stryker/issues/379)) ([986eb6b](https://github.com/stryker-mutator/stryker/commit/986eb6b))




<a name="0.9.2"></a>
## [0.9.2](https://github.com/stryker-mutator/stryker/compare/stryker@0.9.1...stryker@0.9.2) (2017-09-06)


### Bug Fixes

* **init command:** indent "stryker.conf.js" file after "stryker init" ([52ac439](https://github.com/stryker-mutator/stryker/commit/52ac439))




<a name="0.9.1"></a>
## [0.9.1](https://github.com/stryker-mutator/stryker/compare/stryker@0.9.0...stryker@0.9.1) (2017-09-04)


### Bug Fixes

* **stryker-init:** Stryker init won't create temp folder ([#361](https://github.com/stryker-mutator/stryker/issues/361)) ([a4333c9](https://github.com/stryker-mutator/stryker/commit/a4333c9))




<a name="0.9.0"></a>
# [0.9.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.8.0...stryker@0.9.0) (2017-08-25)


### Bug Fixes

* **MochaTestRunner:** Exit with a warning if no tests were executed (#360) ([ac52860](https://github.com/stryker-mutator/stryker/commit/ac52860))


### Code Refactoring

* change ConfigWriter interface name to ConfigEditor (#357) ([ec4ae03](https://github.com/stryker-mutator/stryker/commit/ec4ae03))


### BREAKING CHANGES

* Public api for `ConfigWriter` is renamed to `ConfigEditor`. The corresponding `write` method is renamed to `edit`. If you're using custom `ConfigWriter` plugins you should rename the `write` method to `edit`. Please update the `stryker-mocha-framework` and `stryker-karma-runner` to the latest versions as they provide the new `ConfigEditor` plugin.




<a name="0.8.0"></a>
# [0.8.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.7.0...stryker@0.8.0) (2017-08-11)


### Features

* **ci-integration:** Configurable thresholds based on mutation score (#355) ([93f28cc](https://github.com/stryker-mutator/stryker/commit/93f28cc)), closes [#220](https://github.com/stryker-mutator/stryker/issues/220)
* **IsolatedTestRunner:** Handle promise rejections (#351) ([f596993](https://github.com/stryker-mutator/stryker/commit/f596993))




<a name="0.7.0"></a>
# [0.7.0](https://github.com/stryker-mutator/stryker/compare/stryker@0.6.7...stryker@0.7.0) (2017-08-04)


### Features

* **ConfigReader:** Inform about init command (#340) ([7f3e61f](https://github.com/stryker-mutator/stryker/commit/7f3e61f))
* **html-reporter:** Score result as single source of truth (#341) ([47b3295](https://github.com/stryker-mutator/stryker/commit/47b3295)), closes [#335](https://github.com/stryker-mutator/stryker/issues/335)




<a name="0.6.7"></a>
## [0.6.7](https://github.com/stryker-mutator/stryker/compare/stryker@0.6.6...stryker@0.6.7) (2017-07-14)


### Bug Fixes

* **ts-2.4:** Fix type issues for typescript 2.4 (#337) ([c18079b](https://github.com/stryker-mutator/stryker/commit/c18079b)), closes [#337](https://github.com/stryker-mutator/stryker/issues/337)




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
