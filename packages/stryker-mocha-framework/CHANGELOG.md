# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.7.2"></a>
## [0.7.2](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-framework@0.7.1...stryker-mocha-framework@0.7.2) (2017-12-21)




**Note:** Version bump only for package stryker-mocha-framework

<a name="0.7.1"></a>
## [0.7.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-framework@0.7.0...stryker-mocha-framework@0.7.1) (2017-11-27)




**Note:** Version bump only for package stryker-mocha-framework

<a name="0.7.0"></a>
# [0.7.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-framework@0.6.1...stryker-mocha-framework@0.7.0) (2017-11-13)


### Features

* **mocha 4:** Add support for mocha version 4 ([#455](https://github.com/stryker-mutator/stryker/issues/455)) ([de6ae4f](https://github.com/stryker-mutator/stryker/commit/de6ae4f))




<a name="0.6.1"></a>
## [0.6.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-framework@0.6.0...stryker-mocha-framework@0.6.1) (2017-10-24)




**Note:** Version bump only for package stryker-mocha-framework

<a name="0.6.0"></a>
## [0.6.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-framework@0.5.1...stryker-mocha-framework@0.6.0) (2017-10-20)


### Bug Fixes

* **mocha framework:** Select tests based on name ([#413](https://github.com/stryker-mutator/stryker/issues/413)) ([bb7c02f](https://github.com/stryker-mutator/stryker/commit/bb7c02f)), closes [#249](https://github.com/stryker-mutator/stryker/issues/249)


### BREAKING CHANGES

* **mocha framework:** * Change api of `TestFramework`. It now provides an array of `TestSelection` objects, instead of an array of numbers with test ids.




<a name="0.5.1"></a>
## [0.5.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-framework@0.5.0...stryker-mocha-framework@0.5.1) (2017-10-10)




**Note:** Version bump only for package stryker-mocha-framework

<a name="0.5.0"></a>
## [0.5.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-framework@0.4.0...stryker-mocha-framework@0.5.0) (2017-09-19)




<a name="0.4.0"></a>
# [0.4.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-framework@0.3.0...stryker-mocha-framework@0.4.0) (2017-08-25)


### Code Refactoring

* change ConfigWriter interface name to ConfigEditor (#357) ([ec4ae03](https://github.com/stryker-mutator/stryker/commit/ec4ae03))


### BREAKING CHANGES

* Public api for `ConfigWriter` is renamed to `ConfigEditor`. The corresponding `write` method is renamed to `edit`. If you're using custom `ConfigWriter` plugins you should rename the `write` method to `edit`. Please update the `stryker-mocha-framework` and `stryker-karma-runner` to the latest versions as they provide the new `ConfigEditor` plugin.




<a name="0.3.0"></a>
# [0.3.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-framework@0.2.0...stryker-mocha-framework@0.3.0) (2017-08-11)


### Features

* **ci-integration:** Configurable thresholds based on mutation score (#355) ([93f28cc](https://github.com/stryker-mutator/stryker/commit/93f28cc)), closes [#220](https://github.com/stryker-mutator/stryker/issues/220)




<a name="0.2.0"></a>
## [0.2.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-framework@0.1.4...stryker-mocha-framework@0.2.0) (2017-08-04)




<a name="0.1.4"></a>
## [0.1.4](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-framework@0.1.3...stryker-mocha-framework@0.1.4) (2017-07-14)




<a name="0.1.3"></a>
## [0.1.3](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-framework@0.1.2...stryker-mocha-framework@0.1.3) (2017-06-16)


### Bug Fixes

* **npmignore:** Align npm ignores (#321) ([db2a56e](https://github.com/stryker-mutator/stryker/commit/db2a56e))




<a name="0.1.1"></a>
## [0.1.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-framework@0.1.0...stryker-mocha-framework@0.1.1) (2017-06-08)




<a name="0.4.0"></a>
# [0.4.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.4.0...stryker-mocha-runner@0.4.0) (2017-06-02)

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
* **package.json:** Use most recent major versions (#296) ([57236d8](https://github.com/stryker-mutator/stryker/commit/57236d8))
* **TestRunner:** Add try-catch ([0c41fbf](https://github.com/stryker-mutator/stryker/commit/0c41fbf))
* **tsconfig:** Extend base tsconfig and don't exclude typings folder (#298) ([622170b](https://github.com/stryker-mutator/stryker/commit/622170b))
* **tslint:** Add linting ([9c360b2](https://github.com/stryker-mutator/stryker/commit/9c360b2))


### Features

* **es2015-promise:** Remove dep to es6-promise (#5) ([6f38885](https://github.com/stryker-mutator/stryker/commit/6f38885))
* **mocha-framework:** Move mocha test framework to seperate package (#308) ([ae0074e](https://github.com/stryker-mutator/stryker/commit/ae0074e))* **one-pass-coverage:** Update test runner (#4) ([6716519](https://github.com/stryker-mutator/stryker/commit/6716519))
* **ts2:** Migrate to typescript 2 ([0c9a655](https://github.com/stryker-mutator/stryker/commit/0c9a655))
* **unincluded-files:** Support unincluded files ([80297bc](https://github.com/stryker-mutator/stryker/commit/80297bc))

### BREAKING CHANGES

* **mocha-framework:** Users with `testRunner: "mocha",testFramework: "mocha"` should now also install "stryker-mocha-framework".

<a name="0.1.0"></a>
# [0.1.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-framework@0.1.0...stryker-mocha-framework@0.1.0) (2017-06-02)


### Features

* **mocha-framework:** Move mocha test framework to seperate package (#308) ([ae0074e](https://github.com/stryker-mutator/stryker/commit/ae0074e))


### BREAKING CHANGES

* **mocha-framework:** Users with `testRunner: "mocha",testFramework: "mocha"` should now also install "stryker-mocha-framework".
