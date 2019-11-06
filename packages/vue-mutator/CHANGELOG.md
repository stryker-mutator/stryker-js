# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.2.1](https://github.com/stryker-mutator/stryker/compare/v2.2.0...v2.2.1) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/vue-mutator





# [2.2.0](https://github.com/stryker-mutator/stryker/compare/v2.1.0...v2.2.0) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/vue-mutator





# [2.1.0](https://github.com/stryker-mutator/stryker/compare/v2.0.2...v2.1.0) (2019-09-08)

**Note:** Version bump only for package @stryker-mutator/vue-mutator





## [2.0.2](https://github.com/stryker-mutator/stryker/compare/v2.0.1...v2.0.2) (2019-07-11)


### Bug Fixes

* **dispose:** fix race condition in dispose action ([124ef6a](https://github.com/stryker-mutator/stryker/commit/124ef6a)), closes [#1542](https://github.com/stryker-mutator/stryker/issues/1542)





## [2.0.1](https://github.com/stryker-mutator/stryker/compare/v2.0.0...v2.0.1) (2019-07-02)

**Note:** Version bump only for package @stryker-mutator/vue-mutator





# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)


### Bug Fixes

* **vue:** only mutate Vue files with <script> blocks ([#1540](https://github.com/stryker-mutator/stryker/issues/1540)) ([ee4d27c](https://github.com/stryker-mutator/stryker/commit/ee4d27c))


### Features

* **node 6:** drop support for node 6 ([#1517](https://github.com/stryker-mutator/stryker/issues/1517)) ([801d7cd](https://github.com/stryker-mutator/stryker/commit/801d7cd))


### BREAKING CHANGES

* **node 6:** support for Node 6 has been dropped. Node 8 or higher is now required.





## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)

**Note:** Version bump only for package @stryker-mutator/vue-mutator





# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)

**Note:** Version bump only for package @stryker-mutator/vue-mutator





# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)

**Note:** Version bump only for package @stryker-mutator/vue-mutator





## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)

**Note:** Version bump only for package @stryker-mutator/vue-mutator





# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)

**Note:** Version bump only for package @stryker-mutator/vue-mutator





## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)

**Note:** Version bump only for package @stryker-mutator/vue-mutator





## [1.0.2](https://github.com/stryker-mutator/stryker/compare/v1.0.1...v1.0.2) (2019-02-13)


### Bug Fixes

* **stryker init:** update metadata for `stryker init` command ([#1403](https://github.com/stryker-mutator/stryker/issues/1403)) ([38f269b](https://github.com/stryker-mutator/stryker/commit/38f269b)), closes [#1402](https://github.com/stryker-mutator/stryker/issues/1402)





## [1.0.1](https://github.com/stryker-mutator/stryker/compare/v1.0.0...v1.0.1) (2019-02-13)

**Note:** Version bump only for package @stryker-mutator/vue-mutator





## [1.0.0](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.4.1...@stryker-mutator/vue-mutator@1.0.0) (2019-02-13)


### Features

* **ES5 support:** remove ES5 mutator ([#1370](https://github.com/stryker-mutator/stryker/issues/1370)) ([cb585b4](https://github.com/stryker-mutator/stryker/commit/cb585b4))
* **rename:** rename `stryker-xxx-xxx` -> `[@stryker-mutator](https://github.com/stryker-mutator)/xxx-xxx` ([1bbd6ff](https://github.com/stryker-mutator/stryker/commit/1bbd6ff))


### BREAKING CHANGES

* **rename:** The core package and plugins have been renamed: stryker-vue-mutator -> @stryker-mutator/vue-mutator
* **ES5 support:** Remove the ES5 mutator. The 'javascript' mutator is now the default mutator. Users without a mutator plugin should install `@stryker-mutator/javascript-mutator`.





## [0.4.1](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.4.0...stryker-vue-mutator@0.4.1) (2019-02-12)

**Note:** Version bump only for package stryker-vue-mutator





# [0.4.0](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.3.0...stryker-vue-mutator@0.4.0) (2019-02-08)


### Features

* **mutators:** Remove side effects from mutator plugins ([#1352](https://github.com/stryker-mutator/stryker/issues/1352)) ([edaf401](https://github.com/stryker-mutator/stryker/commit/edaf401))





<a name="0.3.0"></a>
# [0.3.0](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.2.14...stryker-vue-mutator@0.3.0) (2018-12-23)


### Features

* **stryker-api:** Support stryker-api 0.23 ([#1293](https://github.com/stryker-mutator/stryker/issues/1293)) ([10720ad](https://github.com/stryker-mutator/stryker/commit/10720ad))




<a name="0.2.14"></a>
## [0.2.14](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.2.13...stryker-vue-mutator@0.2.14) (2018-12-12)




**Note:** Version bump only for package stryker-vue-mutator

<a name="0.2.13"></a>
## [0.2.13](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.2.12...stryker-vue-mutator@0.2.13) (2018-11-29)


### Bug Fixes

* **stryker-api:** Update stryker-api peer dependency version ([677fc28](https://github.com/stryker-mutator/stryker/commit/677fc28))




<a name="0.2.12"></a>
## [0.2.12](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.2.11...stryker-vue-mutator@0.2.12) (2018-11-29)




**Note:** Version bump only for package stryker-vue-mutator

<a name="0.2.11"></a>
## [0.2.11](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.2.10...stryker-vue-mutator@0.2.11) (2018-11-21)




**Note:** Version bump only for package stryker-vue-mutator

<a name="0.2.10"></a>
## [0.2.10](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.2.9...stryker-vue-mutator@0.2.10) (2018-11-13)




**Note:** Version bump only for package stryker-vue-mutator

<a name="0.2.9"></a>
## [0.2.9](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.2.8...stryker-vue-mutator@0.2.9) (2018-11-07)




**Note:** Version bump only for package stryker-vue-mutator

<a name="0.2.8"></a>
## [0.2.8](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.2.6...stryker-vue-mutator@0.2.8) (2018-10-15)


### Bug Fixes

* **version:** Version bump for failed release ([8cf9e87](https://github.com/stryker-mutator/stryker/commit/8cf9e87))




<a name="0.2.6"></a>
## [0.2.6](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.2.5...stryker-vue-mutator@0.2.6) (2018-10-06)




**Note:** Version bump only for package stryker-vue-mutator

<a name="0.2.5"></a>
## [0.2.5](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.2.4...stryker-vue-mutator@0.2.5) (2018-10-03)




**Note:** Version bump only for package stryker-vue-mutator

<a name="0.2.4"></a>
## [0.2.4](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.2.3...stryker-vue-mutator@0.2.4) (2018-09-30)




**Note:** Version bump only for package stryker-vue-mutator

<a name="0.2.3"></a>
## [0.2.3](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.2.2...stryker-vue-mutator@0.2.3) (2018-09-14)




**Note:** Version bump only for package stryker-vue-mutator

<a name="0.2.2"></a>
## [0.2.2](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.2.1...stryker-vue-mutator@0.2.2) (2018-08-28)




**Note:** Version bump only for package stryker-vue-mutator

<a name="0.2.1"></a>
## [0.2.1](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.2.0...stryker-vue-mutator@0.2.1) (2018-08-21)




**Note:** Version bump only for package stryker-vue-mutator

<a name="0.2.0"></a>
# [0.2.0](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.1.2...stryker-vue-mutator@0.2.0) (2018-08-19)


### Features

* **stryker config:** rename config setting `reporter` to `reporters` ([#1088](https://github.com/stryker-mutator/stryker/issues/1088)) ([584218a](https://github.com/stryker-mutator/stryker/commit/584218a)), closes [#793](https://github.com/stryker-mutator/stryker/issues/793)




<a name="0.1.2"></a>
## [0.1.2](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.1.1...stryker-vue-mutator@0.1.2) (2018-08-17)


### Bug Fixes

* **dependencies:** support stryker-api 0.19.0 ([#1087](https://github.com/stryker-mutator/stryker/issues/1087)) ([44ce923](https://github.com/stryker-mutator/stryker/commit/44ce923))




<a name="0.1.1"></a>
## [0.1.1](https://github.com/stryker-mutator/stryker/compare/stryker-vue-mutator@0.1.0...stryker-vue-mutator@0.1.1) (2018-08-17)




**Note:** Version bump only for package stryker-vue-mutator

<a name="0.1.0"></a>
# 0.1.0 (2018-08-16)


### Features

* **Vue:** add Vue mutator ([#723](https://github.com/stryker-mutator/stryker/issues/723)) ([bc28fb6](https://github.com/stryker-mutator/stryker/commit/bc28fb6)), closes [#579](https://github.com/stryker-mutator/stryker/issues/579)
