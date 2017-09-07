# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.7.1"></a>
## [0.7.1](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.7.0...stryker-html-reporter@0.7.1) (2017-09-03)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.7.0"></a>
# [0.7.0](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.6.0...stryker-html-reporter@0.7.0) (2017-08-25)


### Code Refactoring

* change ConfigWriter interface name to ConfigEditor (#357) ([ec4ae03](https://github.com/stryker-mutator/stryker/commit/ec4ae03))


### BREAKING CHANGES

* Public api for `ConfigWriter` is renamed to `ConfigEditor`. The corresponding `write` method is renamed to `edit`. If you're using custom `ConfigWriter` plugins you should rename the `write` method to `edit`. Please update the `stryker-mocha-framework` and `stryker-karma-runner` to the latest versions as they provide the new `ConfigEditor` plugin.




<a name="0.6.0"></a>
# [0.6.0](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.5.0...stryker-html-reporter@0.6.0) (2017-08-11)


### Features

* **ci-integration:** Configurable thresholds based on mutation score (#355) ([93f28cc](https://github.com/stryker-mutator/stryker/commit/93f28cc)), closes [#220](https://github.com/stryker-mutator/stryker/issues/220)
* **IsolatedTestRunner:** Handle promise rejections (#351) ([f596993](https://github.com/stryker-mutator/stryker/commit/f596993))




<a name="0.5.0"></a>
# [0.5.0](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.4.7...stryker-html-reporter@0.5.0) (2017-08-04)


### Features

* **html-reporter:** Score result as single source of truth (#341) ([47b3295](https://github.com/stryker-mutator/stryker/commit/47b3295)), closes [#335](https://github.com/stryker-mutator/stryker/issues/335)




<a name="0.4.7"></a>
## [0.4.7](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.4.6...stryker-html-reporter@0.4.7) (2017-07-14)




<a name="0.4.6"></a>
## [0.4.6](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.4.4...stryker-html-reporter@0.4.6) (2017-06-16)


### Bug Fixes

* **npmignore:** Align npm ignores (#321) ([db2a56e](https://github.com/stryker-mutator/stryker/commit/db2a56e))
* Manual version bump ([a67d90b](https://github.com/stryker-mutator/stryker/commit/a67d90b))




<a name="0.4.3"></a>
## [0.4.3](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.4.2...stryker-html-reporter@0.4.3) (2017-06-08)




<a name="0.4.2"></a>
## 0.4.2 (2017-06-05)

### Bug Fixes

* **deps:** Alter stryker-api to be a peerDependency ([340487f](https://github.com/stryker-mutator/stryker/commit/340487f))
* **deps:** Set version of stryker-api ([cf1f125](https://github.com/stryker-mutator/stryker/commit/cf1f125))

<a name="0.3.0"></a>
# [0.3.0](https://github.com/stryker-mutator/stryker-html-reporter/compare/v0.2.2...v0.3.0) (2016-11-20)


### Features

* **error-result:** Show error and other statistics ([#7](https://github.com/stryker-mutator/stryker-html-reporter/issues/7)) ([3d61cee](https://github.com/stryker-mutator/stryker-html-reporter/commit/3d61cee))



<a name="0.2.2"></a>
## [0.2.2](https://github.com/stryker-mutator/stryker-html-reporter/compare/v0.2.1...v0.2.2) (2016-10-06)


### Bug Fixes

* **file-report:** Remove strikethrough extra char ([#6](https://github.com/stryker-mutator/stryker-html-reporter/issues/6)) ([4cd02be](https://github.com/stryker-mutator/stryker-html-reporter/commit/4cd02be))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/stryker-mutator/stryker-html-reporter/compare/v0.1.1...v0.2.1) (2016-10-03)


### Bug Fixes

* **deps:** Set version of stryker-api ([b31d963](https://github.com/stryker-mutator/stryker-html-reporter/commit/b31d963))


### Features

* **ts2.0:** Migrate to typescript 2.0 ([#4](https://github.com/stryker-mutator/stryker-html-reporter/issues/4)) ([0b0109f](https://github.com/stryker-mutator/stryker-html-reporter/commit/0b0109f))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/stryker-mutator/stryker-html-reporter/compare/v0.1.0...v0.1.1) (2016-07-19)


### Bug Fixes

* **file-utils:** Fix error in recursive dir cleaning ([00fb284](https://github.com/stryker-mutator/stryker-html-reporter/commit/00fb284))
* **html-reporter:** Create file system ([8120977](https://github.com/stryker-mutator/stryker-html-reporter/commit/8120977))
* **stryker-test:** Removed useless assertion ([bf98da2](https://github.com/stryker-mutator/stryker-html-reporter/commit/bf98da2))
* **stryker-test:** Test on unix ([0be41d2](https://github.com/stryker-mutator/stryker-html-reporter/commit/0be41d2))
* **stryker-test:** Test on unix ([6a89f02](https://github.com/stryker-mutator/stryker-html-reporter/commit/6a89f02))
* **stryker-test:** Test on unix ([f65cef6](https://github.com/stryker-mutator/stryker-html-reporter/commit/f65cef6))



<a name="0.1.0"></a>
# [0.1.0](https://github.com/stryker-mutator/stryker-html-reporter/compare/v0.0.2...v0.1.0) (2016-07-08)


### Bug Fixes

* **deps:** Alter stryker-api to be a peerDependency ([7fce9f5](https://github.com/stryker-mutator/stryker-html-reporter/commit/7fce9f5))



<a name="0.0.2"></a>
## [0.0.2](https://github.com/stryker-mutator/stryker-html-reporter/compare/v0.0.1...v0.0.2) (2016-06-24)



<a name="0.0.1"></a>
## 0.0.1 (2016-06-23)
