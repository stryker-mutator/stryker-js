# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
