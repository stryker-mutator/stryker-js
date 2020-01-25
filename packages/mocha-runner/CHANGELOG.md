# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.5.0](https://github.com/stryker-mutator/stryker/compare/v2.4.0...v2.5.0) (2020-01-12)

**Note:** Version bump only for package @stryker-mutator/mocha-runner





# [2.4.0](https://github.com/stryker-mutator/stryker/compare/v2.3.0...v2.4.0) (2019-11-24)

**Note:** Version bump only for package @stryker-mutator/mocha-runner





# [2.3.0](https://github.com/stryker-mutator/stryker/compare/v2.2.1...v2.3.0) (2019-11-13)

**Note:** Version bump only for package @stryker-mutator/mocha-runner





## [2.2.1](https://github.com/stryker-mutator/stryker/compare/v2.2.0...v2.2.1) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/mocha-runner





# [2.2.0](https://github.com/stryker-mutator/stryker/compare/v2.1.0...v2.2.0) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/mocha-runner





# [2.1.0](https://github.com/stryker-mutator/stryker/compare/v2.0.2...v2.1.0) (2019-09-08)


### Features

* **mocha:** support mocha 6.2 ([feddcf1](https://github.com/stryker-mutator/stryker/commit/feddcf1))





## [2.0.2](https://github.com/stryker-mutator/stryker/compare/v2.0.1...v2.0.2) (2019-07-11)

**Note:** Version bump only for package @stryker-mutator/mocha-runner





## [2.0.1](https://github.com/stryker-mutator/stryker/compare/v2.0.0...v2.0.1) (2019-07-02)

**Note:** Version bump only for package @stryker-mutator/mocha-runner





# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)


### Features

* **mocha:** deprecate mocha version 5 and below ([#1529](https://github.com/stryker-mutator/stryker/issues/1529)) ([1c55350](https://github.com/stryker-mutator/stryker/commit/1c55350))
* **node 6:** drop support for node 6 ([#1517](https://github.com/stryker-mutator/stryker/issues/1517)) ([801d7cd](https://github.com/stryker-mutator/stryker/commit/801d7cd))


### BREAKING CHANGES

* **node 6:** support for Node 6 has been dropped. Node 8 or higher is now required.
* **mocha:** the use of mocha version 5 and below is deprecated. Please upgrade to mocha 6 or above. See [their changelog](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#600--2019-02-18) for more information about upgrading.





## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)

**Note:** Version bump only for package @stryker-mutator/mocha-runner





# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)


### Features

* **mocha 6:** support all config formats ([#1511](https://github.com/stryker-mutator/stryker/issues/1511)) ([baa374d](https://github.com/stryker-mutator/stryker/commit/baa374d))





# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)

**Note:** Version bump only for package @stryker-mutator/mocha-runner





## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)

**Note:** Version bump only for package @stryker-mutator/mocha-runner





# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)

**Note:** Version bump only for package @stryker-mutator/mocha-runner





## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)

**Note:** Version bump only for package @stryker-mutator/mocha-runner





## [1.0.2](https://github.com/stryker-mutator/stryker/compare/v1.0.1...v1.0.2) (2019-02-13)


### Bug Fixes

* **stryker init:** update metadata for `stryker init` command ([#1403](https://github.com/stryker-mutator/stryker/issues/1403)) ([38f269b](https://github.com/stryker-mutator/stryker/commit/38f269b)), closes [#1402](https://github.com/stryker-mutator/stryker/issues/1402)





## [1.0.1](https://github.com/stryker-mutator/stryker/compare/v1.0.0...v1.0.1) (2019-02-13)

**Note:** Version bump only for package @stryker-mutator/mocha-runner





## [1.0.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.17.1...@stryker-mutator/mocha-runner@1.0.0) (2019-02-13)


### Features

* **factories:** remove deprecated factories ([#1381](https://github.com/stryker-mutator/stryker/issues/1381)) ([df2fcdf](https://github.com/stryker-mutator/stryker/commit/df2fcdf))
* **rename:** rename `stryker-xxx-xxx` -> `[@stryker-mutator](https://github.com/stryker-mutator)/xxx-xxx` ([1bbd6ff](https://github.com/stryker-mutator/stryker/commit/1bbd6ff))


### BREAKING CHANGES

* **rename:** The core package and plugins have been renamed: stryker-mocha-runner -> @stryker-mutator/mocha-runner
* **factories:** Remove the Factory (and children) from the stryker-api package. Use DI to ensure classes are created. For more information, see https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/api/plugins.md#dependency-injection





## [0.17.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.17.0...stryker-mocha-runner@0.17.1) (2019-02-12)

**Note:** Version bump only for package stryker-mocha-runner





# [0.17.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.16.0...stryker-mocha-runner@0.17.0) (2019-02-08)


### Features

* **config-editors:** Remove side effects from all config editor plugins ([#1317](https://github.com/stryker-mutator/stryker/issues/1317)) ([1f61bed](https://github.com/stryker-mutator/stryker/commit/1f61bed))
* **dependency injection:** Add dependency injection for plugins ([#1313](https://github.com/stryker-mutator/stryker/issues/1313)) ([f90cd56](https://github.com/stryker-mutator/stryker/commit/f90cd56)), closes [#667](https://github.com/stryker-mutator/stryker/issues/667)
* **mocha-runner:** Allow empty mochaOptions.opts file (with `false`) ([d9bba6e](https://github.com/stryker-mutator/stryker/commit/d9bba6e))
* **port:** Deprecate property 'port' ([#1309](https://github.com/stryker-mutator/stryker/issues/1309)) ([2539ee0](https://github.com/stryker-mutator/stryker/commit/2539ee0))
* **test-frameworks:** Remove side effects from all test-framework plugins  ([#1319](https://github.com/stryker-mutator/stryker/issues/1319)) ([a7160f4](https://github.com/stryker-mutator/stryker/commit/a7160f4))
* **test-runner:** Use new plugin system to load TestRunner plugins ([#1361](https://github.com/stryker-mutator/stryker/issues/1361)) ([266247b](https://github.com/stryker-mutator/stryker/commit/266247b))
* **transpilers:** Remove side effects transpiler plugins ([#1351](https://github.com/stryker-mutator/stryker/issues/1351)) ([9a8b539](https://github.com/stryker-mutator/stryker/commit/9a8b539))





<a name="0.16.0"></a>
# [0.16.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.15.3...stryker-mocha-runner@0.16.0) (2018-12-23)


### Features

* **mocha-runner:** Add support for `--grep` option ([#1277](https://github.com/stryker-mutator/stryker/issues/1277)) ([2b8ad7a](https://github.com/stryker-mutator/stryker/commit/2b8ad7a))
* **stryker-api:** Support stryker-api 0.23 ([#1293](https://github.com/stryker-mutator/stryker/issues/1293)) ([10720ad](https://github.com/stryker-mutator/stryker/commit/10720ad))




<a name="0.15.3"></a>
## [0.15.3](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.15.2...stryker-mocha-runner@0.15.3) (2018-12-12)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.15.2"></a>
## [0.15.2](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.15.1...stryker-mocha-runner@0.15.2) (2018-11-29)


### Bug Fixes

* **stryker-api:** Update stryker-api peer dependency version ([677fc28](https://github.com/stryker-mutator/stryker/commit/677fc28))




<a name="0.15.1"></a>
## [0.15.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.15.0...stryker-mocha-runner@0.15.1) (2018-11-29)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.15.0"></a>
# [0.15.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.14.6...stryker-mocha-runner@0.15.0) (2018-11-13)


### Features

* **mocha-runner:** use default mocha.opts file, support relative imports ([#1237](https://github.com/stryker-mutator/stryker/issues/1237)) ([2711c2b](https://github.com/stryker-mutator/stryker/commit/2711c2b)), closes [#1046](https://github.com/stryker-mutator/stryker/issues/1046)




<a name="0.14.6"></a>
## [0.14.6](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.14.5...stryker-mocha-runner@0.14.6) (2018-11-07)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.14.5"></a>
## [0.14.5](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.14.3...stryker-mocha-runner@0.14.5) (2018-10-15)


### Bug Fixes

* **version:** Version bump for failed release ([8cf9e87](https://github.com/stryker-mutator/stryker/commit/8cf9e87))




<a name="0.14.3"></a>
## [0.14.3](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.14.2...stryker-mocha-runner@0.14.3) (2018-10-03)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.14.2"></a>
## [0.14.2](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.14.1...stryker-mocha-runner@0.14.2) (2018-09-14)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.14.1"></a>
## [0.14.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.14.0...stryker-mocha-runner@0.14.1) (2018-08-21)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.14.0"></a>
# [0.14.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.13.3...stryker-mocha-runner@0.14.0) (2018-08-19)


### Features

* **stryker config:** rename config setting `reporter` to `reporters` ([#1088](https://github.com/stryker-mutator/stryker/issues/1088)) ([584218a](https://github.com/stryker-mutator/stryker/commit/584218a)), closes [#793](https://github.com/stryker-mutator/stryker/issues/793)




<a name="0.13.3"></a>
## [0.13.3](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.13.2...stryker-mocha-runner@0.13.3) (2018-08-17)


### Bug Fixes

* **dependencies:** support stryker-api 0.19.0 ([#1087](https://github.com/stryker-mutator/stryker/issues/1087)) ([44ce923](https://github.com/stryker-mutator/stryker/commit/44ce923))




<a name="0.13.2"></a>
## [0.13.2](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.13.1...stryker-mocha-runner@0.13.2) (2018-08-17)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.13.1"></a>
## [0.13.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.13.0...stryker-mocha-runner@0.13.1) (2018-08-03)


### Bug Fixes

* **mocha-runner:** Don't log individual successful tests ([#1042](https://github.com/stryker-mutator/stryker/issues/1042)) ([6732ccf](https://github.com/stryker-mutator/stryker/commit/6732ccf))




<a name="0.13.0"></a>
# [0.13.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.12.3...stryker-mocha-runner@0.13.0) (2018-07-20)


### Bug Fixes

* **Dependencies:** Pin all deps on minor version ([#974](https://github.com/stryker-mutator/stryker/issues/974)) ([f0a7e5a](https://github.com/stryker-mutator/stryker/commit/f0a7e5a)), closes [#954](https://github.com/stryker-mutator/stryker/issues/954) [#967](https://github.com/stryker-mutator/stryker/issues/967)


### Features

* **logging:** Allow log to a file ([#954](https://github.com/stryker-mutator/stryker/issues/954)) ([c2f6b82](https://github.com/stryker-mutator/stryker/commit/c2f6b82)), closes [#748](https://github.com/stryker-mutator/stryker/issues/748)




<a name="0.12.3"></a>
## [0.12.3](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.12.2...stryker-mocha-runner@0.12.3) (2018-07-04)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.12.2"></a>
## [0.12.2](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.12.1...stryker-mocha-runner@0.12.2) (2018-05-31)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.12.1"></a>
## [0.12.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.12.0...stryker-mocha-runner@0.12.1) (2018-05-21)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.12.0"></a>
# [0.12.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.11.2...stryker-mocha-runner@0.12.0) (2018-04-30)


### Features

* **node version:** drop node 4 support ([#724](https://github.com/stryker-mutator/stryker/issues/724)) ([a038931](https://github.com/stryker-mutator/stryker/commit/a038931))


### BREAKING CHANGES

* **node version:** Node 4 is no longer supported.




<a name="0.11.2"></a>
## [0.11.2](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.11.1...stryker-mocha-runner@0.11.2) (2018-04-20)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.11.1"></a>
## [0.11.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.11.0...stryker-mocha-runner@0.11.1) (2018-04-11)


### Bug Fixes

* Support stryker-api 0.16.0 ([#691](https://github.com/stryker-mutator/stryker/issues/691)) ([b2b019d](https://github.com/stryker-mutator/stryker/commit/b2b019d))




<a name="0.11.0"></a>
# [0.11.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.8...stryker-mocha-runner@0.11.0) (2018-04-04)


### Features

* **mocha-runner:** implement file discovery in mocha ([6ed7a0f](https://github.com/stryker-mutator/stryker/commit/6ed7a0f))




<a name="0.10.8"></a>
## [0.10.8](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.7...stryker-mocha-runner@0.10.8) (2018-03-22)


### Bug Fixes

* **peerDependency:** update stryker-api requirement to ^0.14.0 ([3ce04d4](https://github.com/stryker-mutator/stryker/commit/3ce04d4))




<a name="0.10.7"></a>
## [0.10.7](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.6...stryker-mocha-runner@0.10.7) (2018-03-22)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.10.6"></a>
## [0.10.6](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.5...stryker-mocha-runner@0.10.6) (2018-03-21)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.10.5"></a>
## [0.10.5](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.4...stryker-mocha-runner@0.10.5) (2018-02-07)


### Bug Fixes

* **dependencies:** update stryker-api requirement to ^0.13.0 ([8eba6d4](https://github.com/stryker-mutator/stryker/commit/8eba6d4))




<a name="0.10.4"></a>
## [0.10.4](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.3...stryker-mocha-runner@0.10.4) (2018-02-07)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.10.3"></a>
## [0.10.3](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.2...stryker-mocha-runner@0.10.3) (2018-01-19)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.10.2"></a>
## [0.10.2](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.1...stryker-mocha-runner@0.10.2) (2017-12-21)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.10.1"></a>
## [0.10.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.0...stryker-mocha-runner@0.10.1) (2017-11-27)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.10.0"></a>
# [0.10.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.9.1...stryker-mocha-runner@0.10.0) (2017-11-13)


### Features

* **mocha 4:** Add support for mocha version 4 ([#455](https://github.com/stryker-mutator/stryker/issues/455)) ([de6ae4f](https://github.com/stryker-mutator/stryker/commit/de6ae4f))




<a name="0.9.1"></a>
## [0.9.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.9.0...stryker-mocha-runner@0.9.1) (2017-10-24)




**Note:** Version bump only for package stryker-mocha-runner

<a name="0.9.0"></a>
# [0.9.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.8.1...stryker-mocha-runner@0.9.0) (2017-10-20)


### Bug Fixes

* **mocha framework:** Select tests based on name ([#413](https://github.com/stryker-mutator/stryker/issues/413)) ([bb7c02f](https://github.com/stryker-mutator/stryker/commit/bb7c02f)), closes [#249](https://github.com/stryker-mutator/stryker/issues/249)


### Features

* **mocha options:** Add support for mocha options ([#427](https://github.com/stryker-mutator/stryker/issues/427)) ([e0229c8](https://github.com/stryker-mutator/stryker/commit/e0229c8)), closes [#417](https://github.com/stryker-mutator/stryker/issues/417)


### BREAKING CHANGES

* **mocha framework:** * Change api of `TestFramework`. It now provides an array of `TestSelection` objects, instead of an array of numbers with test ids.




<a name="0.8.1"></a>
## [0.8.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.8.0...stryker-mocha-runner@0.8.1) (2017-09-22)


### Bug Fixes

* **package.json:** Add dependency to tslib. ([#387](https://github.com/stryker-mutator/stryker/issues/387)) ([fcc8b88](https://github.com/stryker-mutator/stryker/commit/fcc8b88))




<a name="0.8.0"></a>
# [0.8.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.7.0...stryker-mocha-runner@0.8.0) (2017-09-19)


### Features

* **typescript:** Add support for TypeScript mutation testing (#376) ([ba78168](https://github.com/stryker-mutator/stryker/commit/ba78168))


### BREAKING CHANGES

* **typescript:** * Hoist the `Mutator` interface to a higher abstraction. With this interface it was possible to add mutators for specific ES5 AST nodes. As we're moving away from ES5, this plugin abstraction had to be hoisted to a higher level. It is no longer possible to plugin a specific ES5 node mutator.
* Update `report` interface: Rename `MutantState.Error` => `MutantState.RuntimeError`.




<a name="0.7.0"></a>
# [0.7.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.6.0...stryker-mocha-runner@0.7.0) (2017-08-25)


### Bug Fixes

* **MochaTestRunner:** Exit with a warning if no tests were executed (#360) ([ac52860](https://github.com/stryker-mutator/stryker/commit/ac52860))


### Code Refactoring

* change ConfigWriter interface name to ConfigEditor (#357) ([ec4ae03](https://github.com/stryker-mutator/stryker/commit/ec4ae03))


### BREAKING CHANGES

* Public api for `ConfigWriter` is renamed to `ConfigEditor`. The corresponding `write` method is renamed to `edit`. If you're using custom `ConfigWriter` plugins you should rename the `write` method to `edit`. Please update the `stryker-mocha-framework` and `stryker-karma-runner` to the latest versions as they provide the new `ConfigEditor` plugin.




<a name="0.6.0"></a>
# [0.6.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.5.0...stryker-mocha-runner@0.6.0) (2017-08-11)


### Features

* **ci-integration:** Configurable thresholds based on mutation score (#355) ([93f28cc](https://github.com/stryker-mutator/stryker/commit/93f28cc)), closes [#220](https://github.com/stryker-mutator/stryker/issues/220)




<a name="0.5.0"></a>
## [0.5.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.4.4...stryker-mocha-runner@0.5.0) (2017-08-04)




<a name="0.4.4"></a>
## [0.4.4](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.4.3...stryker-mocha-runner@0.4.4) (2017-07-14)




<a name="0.4.3"></a>
## [0.4.3](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.4.2...stryker-mocha-runner@0.4.3) (2017-06-16)


### Bug Fixes

* **npmignore:** Align npm ignores (#321) ([db2a56e](https://github.com/stryker-mutator/stryker/commit/db2a56e))




<a name="0.4.1"></a>
## [0.4.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.4.0...stryker-mocha-runner@0.4.1) (2017-06-08)




<a name="0.3.0"></a>
# 0.3.0 (2017-04-21)


### Bug Fixes

* **deps:** Add stryker-api as peerDependency ([8b01a66](https://github.com/stryker-mutator/stryker/commit/8b01a66))
* **deps:** Add typings as dev-dependency ([4ee866a](https://github.com/stryker-mutator/stryker/commit/4ee866a))
* **deps:** Fix peer dependency version for mocha ([780ca90](https://github.com/stryker-mutator/stryker/commit/780ca90))
* **deps:** Remove unused dependency ([121a549](https://github.com/stryker-mutator/stryker/commit/121a549))
* **deps:** Remove unused dependency ([1f6dbba](https://github.com/stryker-mutator/stryker/commit/1f6dbba))
* **deps:** Set version of stryker api ([49a1384](https://github.com/stryker-mutator/stryker/commit/49a1384))
* **deps:** Update out dated dependencies ([cc0be9a](https://github.com/stryker-mutator/stryker/commit/cc0be9a))
* **deps:** Update outdated dependencies ([0fc17be](https://github.com/stryker-mutator/stryker/commit/0fc17be))
* **deps:** Update version stryker-api ([3a1a36c](https://github.com/stryker-mutator/stryker/commit/3a1a36c))
* **index:** Add file which loads the TestRunner ([55fd132](https://github.com/stryker-mutator/stryker/commit/55fd132))
* **TestRunner:** Add try-catch ([0c41fbf](https://github.com/stryker-mutator/stryker/commit/0c41fbf))
* **tslint:** Add linting ([9c360b2](https://github.com/stryker-mutator/stryker/commit/9c360b2))


### Features

* **es2015-promise:** Remove dep to es6-promise (#5) ([6f38885](https://github.com/stryker-mutator/stryker/commit/6f38885))
* **one-pass-coverage:** Update test runner (#4) ([6716519](https://github.com/stryker-mutator/stryker/commit/6716519))
* **ts2:** Migrate to typescript 2 ([0c9a655](https://github.com/stryker-mutator/stryker/commit/0c9a655))
* **unincluded-files:** Support unincluded files ([80297bc](https://github.com/stryker-mutator/stryker/commit/80297bc))




<a name="0.2.0"></a>
# [0.2.0](https://github.com/stryker-mutator/stryker-mocha-runner/compare/v0.1.1...v0.2.0) (2016-11-20)


### Features

* **one-pass-coverage:** Update test runner  ([#4](https://github.com/stryker-mutator/stryker-mocha-runner/issues/4)) ([d6aebaa](https://github.com/stryker-mutator/stryker-mocha-runner/commit/d6aebaa))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/stryker-mutator/stryker-mocha-runner/compare/v0.1.0...v0.1.1) (2016-10-03)


### Bug Fixes

* **deps:** Fix peer dependency version for mocha ([aa09049](https://github.com/stryker-mutator/stryker-mocha-runner/commit/aa09049))
* **deps:** Remove unused dependency ([88530be](https://github.com/stryker-mutator/stryker-mocha-runner/commit/88530be))
* **deps:** Remove unused dependency ([f3b4ff4](https://github.com/stryker-mutator/stryker-mocha-runner/commit/f3b4ff4))
* **deps:** Set version of stryker api ([c772fe0](https://github.com/stryker-mutator/stryker-mocha-runner/commit/c772fe0))
* **deps:** Update out dated dependencies ([c6e166f](https://github.com/stryker-mutator/stryker-mocha-runner/commit/c6e166f))
* **deps:** Update outdated dependencies ([d0e4eaf](https://github.com/stryker-mutator/stryker-mocha-runner/commit/d0e4eaf))
* **deps:** Update version stryker-api ([a632624](https://github.com/stryker-mutator/stryker-mocha-runner/commit/a632624))
* **tslint:** Add linting ([33e4c6e](https://github.com/stryker-mutator/stryker-mocha-runner/commit/33e4c6e))


### Features

* **ts2:** Migrate to typescript 2 ([bcd4064](https://github.com/stryker-mutator/stryker-mocha-runner/commit/bcd4064))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/stryker-mutator/stryker-mocha-runner/compare/v0.0.2...v0.1.0) (2016-07-21)



<a name="0.0.2"></a>
## [0.0.2](https://github.com/stryker-mutator/stryker-mocha-runner/compare/v0.0.1...v0.0.2) (2016-07-19)



<a name="0.0.1"></a>
## [0.0.1](https://github.com/stryker-mutator/stryker-mocha-runner/compare/79aeabc...v0.0.1) (2016-07-19)


### Bug Fixes

* **deps:** Add stryker-api as peerDependency ([66aec0c](https://github.com/stryker-mutator/stryker-mocha-runner/commit/66aec0c))
* **deps:** Add typings as dev-dependency ([79aeabc](https://github.com/stryker-mutator/stryker-mocha-runner/commit/79aeabc))
* **index:** Add file which loads the TestRunner ([1be6179](https://github.com/stryker-mutator/stryker-mocha-runner/commit/1be6179))
* **TestRunner:** Add try-catch ([e589e53](https://github.com/stryker-mutator/stryker-mocha-runner/commit/e589e53))


### Features

* **unincluded-files:** Support unincluded files ([00ba196](https://github.com/stryker-mutator/stryker-mocha-runner/commit/00ba196))
