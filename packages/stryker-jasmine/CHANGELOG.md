# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.7.3"></a>
## [0.7.3](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine@0.7.2...stryker-jasmine@0.7.3) (2017-12-21)




**Note:** Version bump only for package stryker-jasmine

<a name="0.7.2"></a>
## [0.7.2](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine@0.7.1...stryker-jasmine@0.7.2) (2017-11-27)




**Note:** Version bump only for package stryker-jasmine

<a name="0.7.1"></a>
## [0.7.1](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine@0.7.0...stryker-jasmine@0.7.1) (2017-10-24)




**Note:** Version bump only for package stryker-jasmine

<a name="0.7.0"></a>
## [0.7.0](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine@0.6.0...stryker-jasmine@0.7.0) (2017-10-20)


### Bug Fixes

* **mocha framework:** Select tests based on name ([#413](https://github.com/stryker-mutator/stryker/issues/413)) ([bb7c02f](https://github.com/stryker-mutator/stryker/commit/bb7c02f)), closes [#249](https://github.com/stryker-mutator/stryker/issues/249)


### BREAKING CHANGES

* **mocha framework:** * Change api of `TestFramework`. It now provides an array of `TestSelection` objects, instead of an array of numbers with test ids.




<a name="0.6.0"></a>
## [0.6.0](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine@0.5.0...stryker-jasmine@0.6.0) (2017-09-19)




<a name="0.5.0"></a>
# [0.5.0](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine@0.4.0...stryker-jasmine@0.5.0) (2017-08-25)


### Code Refactoring

* change ConfigWriter interface name to ConfigEditor (#357) ([ec4ae03](https://github.com/stryker-mutator/stryker/commit/ec4ae03))


### BREAKING CHANGES

* Public api for `ConfigWriter` is renamed to `ConfigEditor`. The corresponding `write` method is renamed to `edit`. If you're using custom `ConfigWriter` plugins you should rename the `write` method to `edit`. Please update the `stryker-mocha-framework` and `stryker-karma-runner` to the latest versions as they provide the new `ConfigEditor` plugin.




<a name="0.4.0"></a>
# [0.4.0](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine@0.3.0...stryker-jasmine@0.4.0) (2017-08-11)


### Features

* **ci-integration:** Configurable thresholds based on mutation score (#355) ([93f28cc](https://github.com/stryker-mutator/stryker/commit/93f28cc)), closes [#220](https://github.com/stryker-mutator/stryker/issues/220)




<a name="0.3.0"></a>
## [0.3.0](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine@0.2.7...stryker-jasmine@0.3.0) (2017-08-04)




<a name="0.2.7"></a>
## [0.2.7](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine@0.2.6...stryker-jasmine@0.2.7) (2017-07-14)




<a name="0.2.6"></a>
## [0.2.6](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine@0.2.4...stryker-jasmine@0.2.6) (2017-06-16)


### Bug Fixes

* **npmignore:** Align npm ignores (#321) ([db2a56e](https://github.com/stryker-mutator/stryker/commit/db2a56e))
* Manual version bump ([a67d90b](https://github.com/stryker-mutator/stryker/commit/a67d90b))




<a name="0.2.3"></a>
## [0.2.3](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine@0.2.2...stryker-jasmine@0.2.3) (2017-06-08)




<a name="0.2.2"></a>
## 0.2.2 (2017-06-02)

<a name="0.2.0"></a>
# 0.2.0 (2017-04-21)


### Bug Fixes

* **deps:** Update stryker-api version ([d685481](https://github.com/stryker-mutator/stryker/commit/d685481))


### Features

* **es2015-promise:** Remove dep to es6-promise (#2) ([413c22a](https://github.com/stryker-mutator/stryker/commit/413c22a))
* **jasmine:** Add jasmine test framework ([85709b0](https://github.com/stryker-mutator/stryker/commit/85709b0))




<a name="0.1.0"></a>
# [0.1.0](https://github.com/stryker-mutator/stryker-jasmine/compare/v0.0.3...v0.1.0) (2016-11-20)



<a name="0.0.3"></a>
## 0.0.3 (2016-11-13)

* chore: release v0.0.3 ([9eda27c](https://github.com/stryker-mutator/stryker-jasmine/commit/9eda27c))
* fix(deps): Update stryker-api version ([db11569](https://github.com/stryker-mutator/stryker-jasmine/commit/db11569))



<a name="0.0.2"></a>
## 0.0.2 (2016-11-12)

* chore: release v0.0.2 ([72596fb](https://github.com/stryker-mutator/stryker-jasmine/commit/72596fb))
* chore: Update stryker-api dep ([b5e7b1a](https://github.com/stryker-mutator/stryker-jasmine/commit/b5e7b1a))



<a name="0.0.1"></a>
## 0.0.1 (2016-11-12)

* chore: initial changelog ([12f1693](https://github.com/stryker-mutator/stryker-jasmine/commit/12f1693))
* chore: Prepare for first release ([1227e2b](https://github.com/stryker-mutator/stryker-jasmine/commit/1227e2b))
* chore: release v0.0.1 ([4bbede4](https://github.com/stryker-mutator/stryker-jasmine/commit/4bbede4))
* chore: update contributors ([380aeed](https://github.com/stryker-mutator/stryker-jasmine/commit/380aeed))
* feat(jasmine): Add jasmine test framework ([4f992e4](https://github.com/stryker-mutator/stryker-jasmine/commit/4f992e4))
