# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.1.0](https://github.com/stryker-mutator/stryker/compare/v3.0.2...v3.1.0) (2020-03-29)

**Note:** Version bump only for package @stryker-mutator/html-reporter





## [3.0.2](https://github.com/stryker-mutator/stryker/compare/v3.0.1...v3.0.2) (2020-03-13)


### Bug Fixes

* **nodejs requirement:** set NodeJS requirement to at least Node 10 ([8c08059](https://github.com/stryker-mutator/stryker/commit/8c080594a87d638ea4349ee69e05ed6c7eba6463))





## [3.0.1](https://github.com/stryker-mutator/stryker/compare/v3.0.0...v3.0.1) (2020-03-12)

**Note:** Version bump only for package @stryker-mutator/html-reporter





# [3.0.0](https://github.com/stryker-mutator/stryker/compare/v2.5.0...v3.0.0) (2020-03-11)


### Features

* **HtmlReporter:** include the html reporter in the core package and add it to the default reporters ([#2036](https://github.com/stryker-mutator/stryker/issues/2036)) ([09702d9](https://github.com/stryker-mutator/stryker/commit/09702d9a05387f407d8fc43d21db38b3a14cbec7)), closes [#1919](https://github.com/stryker-mutator/stryker/issues/1919)
* **promisified fs:** use node 10 promisified functions ([#2028](https://github.com/stryker-mutator/stryker/issues/2028)) ([1c57d8f](https://github.com/stryker-mutator/stryker/commit/1c57d8f4620c2392e167f45fa20aa6acbd0c7a7d))


### BREAKING CHANGES

* **HtmlReporter:** the `html` reporter is now enabled by default. If you don't want to use it, be sure to override the `reporters` configuration option.

```json
{
  "reporters": ["progress", "clear-text"]
}
```
* **promisified fs:** removed fsAsPromised from @stryker-mutator/util






# [2.5.0](https://github.com/stryker-mutator/stryker/compare/v2.4.0...v2.5.0) (2020-01-12)

**Note:** Version bump only for package @stryker-mutator/html-reporter





# [2.4.0](https://github.com/stryker-mutator/stryker/compare/v2.3.0...v2.4.0) (2019-11-24)

**Note:** Version bump only for package @stryker-mutator/html-reporter





# [2.3.0](https://github.com/stryker-mutator/stryker/compare/v2.2.1...v2.3.0) (2019-11-13)

**Note:** Version bump only for package @stryker-mutator/html-reporter





## [2.2.1](https://github.com/stryker-mutator/stryker/compare/v2.2.0...v2.2.1) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/html-reporter





# [2.2.0](https://github.com/stryker-mutator/stryker/compare/v2.1.0...v2.2.0) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/html-reporter





# [2.1.0](https://github.com/stryker-mutator/stryker/compare/v2.0.2...v2.1.0) (2019-09-08)

**Note:** Version bump only for package @stryker-mutator/html-reporter





## [2.0.2](https://github.com/stryker-mutator/stryker/compare/v2.0.1...v2.0.2) (2019-07-11)

**Note:** Version bump only for package @stryker-mutator/html-reporter





## [2.0.1](https://github.com/stryker-mutator/stryker/compare/v2.0.0...v2.0.1) (2019-07-02)


### Bug Fixes

* **html:** set utf-8 charset ([#1592](https://github.com/stryker-mutator/stryker/issues/1592)) ([fb858ca](https://github.com/stryker-mutator/stryker/commit/fb858ca))





# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)


### Features

* **node 6:** drop support for node 6 ([#1517](https://github.com/stryker-mutator/stryker/issues/1517)) ([801d7cd](https://github.com/stryker-mutator/stryker/commit/801d7cd))


### BREAKING CHANGES

* **node 6:** support for Node 6 has been dropped. Node 8 or higher is now required.





## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)

**Note:** Version bump only for package @stryker-mutator/html-reporter





# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)


### Bug Fixes

* **html:** load report json from a js file ([#1485](https://github.com/stryker-mutator/stryker/issues/1485)) ([9bee2a7](https://github.com/stryker-mutator/stryker/commit/9bee2a7)), closes [#1482](https://github.com/stryker-mutator/stryker/issues/1482)





# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)


### Features

* **html-reporter:** use mutation-testing-elements ([2f6df38](https://github.com/stryker-mutator/stryker/commit/2f6df38))
* **peer-dep:** update stryker core to v1.2 ([d798b19](https://github.com/stryker-mutator/stryker/commit/d798b19))





## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)

**Note:** Version bump only for package @stryker-mutator/html-reporter





# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)

**Note:** Version bump only for package @stryker-mutator/html-reporter





## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)

**Note:** Version bump only for package @stryker-mutator/html-reporter





## [1.0.2](https://github.com/stryker-mutator/stryker/compare/v1.0.1...v1.0.2) (2019-02-13)


### Bug Fixes

* **stryker init:** update metadata for `stryker init` command ([#1403](https://github.com/stryker-mutator/stryker/issues/1403)) ([38f269b](https://github.com/stryker-mutator/stryker/commit/38f269b)), closes [#1402](https://github.com/stryker-mutator/stryker/issues/1402)





## [1.0.1](https://github.com/stryker-mutator/stryker/compare/v1.0.0...v1.0.1) (2019-02-13)

**Note:** Version bump only for package @stryker-mutator/html-reporter





## [1.0.0](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.18.1...@stryker-mutator/html-reporter@1.0.0) (2019-02-13)


### Features

* **rename:** rename `stryker-xxx-xxx` -> `[@stryker-mutator](https://github.com/stryker-mutator)/xxx-xxx` ([1bbd6ff](https://github.com/stryker-mutator/stryker/commit/1bbd6ff))


### BREAKING CHANGES

* **rename:** The core package and plugins have been renamed: stryker-html-reporter -> @stryker-mutator/html-reporter





## [0.18.1](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.18.0...stryker-html-reporter@0.18.1) (2019-02-12)

**Note:** Version bump only for package stryker-html-reporter





# [0.18.0](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.17.0...stryker-html-reporter@0.18.0) (2019-02-08)


### Features

* **html-reporter:** Remove side effects from html reporter ([#1314](https://github.com/stryker-mutator/stryker/issues/1314)) ([66d65f7](https://github.com/stryker-mutator/stryker/commit/66d65f7))





<a name="0.17.0"></a>
# [0.17.0](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.16.10...stryker-html-reporter@0.17.0) (2018-12-23)


### Features

* **stryker-api:** Support stryker-api 0.23 ([#1293](https://github.com/stryker-mutator/stryker/issues/1293)) ([10720ad](https://github.com/stryker-mutator/stryker/commit/10720ad))




<a name="0.16.10"></a>
## [0.16.10](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.16.9...stryker-html-reporter@0.16.10) (2018-12-12)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.16.9"></a>
## [0.16.9](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.16.8...stryker-html-reporter@0.16.9) (2018-11-29)


### Bug Fixes

* **stryker-api:** Update stryker-api peer dependency version ([677fc28](https://github.com/stryker-mutator/stryker/commit/677fc28))




<a name="0.16.8"></a>
## [0.16.8](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.16.7...stryker-html-reporter@0.16.8) (2018-11-29)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.16.7"></a>
## [0.16.7](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.16.6...stryker-html-reporter@0.16.7) (2018-11-13)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.16.6"></a>
## [0.16.6](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.16.5...stryker-html-reporter@0.16.6) (2018-11-07)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.16.5"></a>
## [0.16.5](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.16.4...stryker-html-reporter@0.16.5) (2018-10-15)


### Bug Fixes

* **any-promise:** Don't register a promise implementation ([#1180](https://github.com/stryker-mutator/stryker/issues/1180)) ([1d3e2f6](https://github.com/stryker-mutator/stryker/commit/1d3e2f6))




<a name="0.16.4"></a>
## [0.16.4](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.16.3...stryker-html-reporter@0.16.4) (2018-10-03)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.16.3"></a>
## [0.16.3](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.16.2...stryker-html-reporter@0.16.3) (2018-09-30)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.16.2"></a>
## [0.16.2](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.16.1...stryker-html-reporter@0.16.2) (2018-09-14)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.16.1"></a>
## [0.16.1](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.16.0...stryker-html-reporter@0.16.1) (2018-08-21)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.16.0"></a>
# [0.16.0](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.15.3...stryker-html-reporter@0.16.0) (2018-08-19)


### Features

* **stryker config:** rename config setting `reporter` to `reporters` ([#1088](https://github.com/stryker-mutator/stryker/issues/1088)) ([584218a](https://github.com/stryker-mutator/stryker/commit/584218a)), closes [#793](https://github.com/stryker-mutator/stryker/issues/793)




<a name="0.15.3"></a>
## [0.15.3](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.15.2...stryker-html-reporter@0.15.3) (2018-08-17)


### Bug Fixes

* **dependencies:** support stryker-api 0.19.0 ([#1087](https://github.com/stryker-mutator/stryker/issues/1087)) ([44ce923](https://github.com/stryker-mutator/stryker/commit/44ce923))




<a name="0.15.2"></a>
## [0.15.2](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.15.1...stryker-html-reporter@0.15.2) (2018-08-17)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.15.1"></a>
## [0.15.1](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.15.0...stryker-html-reporter@0.15.1) (2018-08-03)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.15.0"></a>
# [0.15.0](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.14.3...stryker-html-reporter@0.15.0) (2018-07-20)


### Bug Fixes

* **Dependencies:** Pin all deps on minor version ([#974](https://github.com/stryker-mutator/stryker/issues/974)) ([f0a7e5a](https://github.com/stryker-mutator/stryker/commit/f0a7e5a)), closes [#954](https://github.com/stryker-mutator/stryker/issues/954) [#967](https://github.com/stryker-mutator/stryker/issues/967)


### Features

* **logging:** Allow log to a file ([#954](https://github.com/stryker-mutator/stryker/issues/954)) ([c2f6b82](https://github.com/stryker-mutator/stryker/commit/c2f6b82)), closes [#748](https://github.com/stryker-mutator/stryker/issues/748)




<a name="0.14.3"></a>
## [0.14.3](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.14.2...stryker-html-reporter@0.14.3) (2018-07-04)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.14.2"></a>
## [0.14.2](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.14.1...stryker-html-reporter@0.14.2) (2018-05-31)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.14.1"></a>
## [0.14.1](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.14.0...stryker-html-reporter@0.14.1) (2018-05-21)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.14.0"></a>
# [0.14.0](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.13.3...stryker-html-reporter@0.14.0) (2018-04-30)


### Features

* **node version:** drop node 4 support ([#724](https://github.com/stryker-mutator/stryker/issues/724)) ([a038931](https://github.com/stryker-mutator/stryker/commit/a038931))


### BREAKING CHANGES

* **node version:** Node 4 is no longer supported.




<a name="0.13.3"></a>
## [0.13.3](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.13.2...stryker-html-reporter@0.13.3) (2018-04-20)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.13.2"></a>
## [0.13.2](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.13.1...stryker-html-reporter@0.13.2) (2018-04-12)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.13.1"></a>
## [0.13.1](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.13.0...stryker-html-reporter@0.13.1) (2018-04-11)


### Bug Fixes

* Support stryker-api 0.16.0 ([#691](https://github.com/stryker-mutator/stryker/issues/691)) ([b2b019d](https://github.com/stryker-mutator/stryker/commit/b2b019d))




<a name="0.13.0"></a>
## [0.13.0](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.12.4...stryker-html-reporter@0.13.0) (2018-04-04)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.12.4"></a>
## [0.12.4](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.12.3...stryker-html-reporter@0.12.4) (2018-03-22)


### Bug Fixes

* **peerDependency:** update stryker-api requirement to ^0.14.0 ([3ce04d4](https://github.com/stryker-mutator/stryker/commit/3ce04d4))




<a name="0.12.3"></a>
## [0.12.3](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.12.2...stryker-html-reporter@0.12.3) (2018-03-22)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.12.2"></a>
## [0.12.2](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.12.1...stryker-html-reporter@0.12.2) (2018-03-21)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.12.1"></a>
## [0.12.1](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.12.0...stryker-html-reporter@0.12.1) (2018-02-07)


### Bug Fixes

* **dependencies:** update stryker-api requirement to ^0.13.0 ([8eba6d4](https://github.com/stryker-mutator/stryker/commit/8eba6d4))




<a name="0.12.0"></a>
# [0.12.0](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.11.5...stryker-html-reporter@0.12.0) (2018-02-07)


### Features

* **coverage analysis:** Support transpiled code ([#559](https://github.com/stryker-mutator/stryker/issues/559)) ([7c351ad](https://github.com/stryker-mutator/stryker/commit/7c351ad))




<a name="0.11.5"></a>
## [0.11.5](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.11.4...stryker-html-reporter@0.11.5) (2018-01-24)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.11.4"></a>
## [0.11.4](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.11.3...stryker-html-reporter@0.11.4) (2017-12-21)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.11.3"></a>
## [0.11.3](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.11.2...stryker-html-reporter@0.11.3) (2017-12-05)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.11.2"></a>
## [0.11.2](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.11.1...stryker-html-reporter@0.11.2) (2017-11-27)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.11.1"></a>
## [0.11.1](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.11.0...stryker-html-reporter@0.11.1) (2017-11-13)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.11.0"></a>
# [0.11.0](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.10.2...stryker-html-reporter@0.11.0) (2017-10-29)


### Features

* **html reporter:** Make report gh-pages compatible ([#432](https://github.com/stryker-mutator/stryker/issues/432)) ([cfc1fb2](https://github.com/stryker-mutator/stryker/commit/cfc1fb2)), closes [#420](https://github.com/stryker-mutator/stryker/issues/420)




<a name="0.10.2"></a>
## [0.10.2](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.10.1...stryker-html-reporter@0.10.2) (2017-10-26)


### Bug Fixes

* **html report:** Add consistency in numbering of mutants ([#431](https://github.com/stryker-mutator/stryker/issues/431)) ([67be708](https://github.com/stryker-mutator/stryker/commit/67be708)), closes [#422](https://github.com/stryker-mutator/stryker/issues/422)




<a name="0.10.1"></a>
## [0.10.1](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.10.0...stryker-html-reporter@0.10.1) (2017-10-24)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.10.0"></a>
## [0.10.0](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.9.1...stryker-html-reporter@0.10.0) (2017-10-20)




**Note:** Version bump only for package stryker-html-reporter

<a name="0.9.1"></a>
## [0.9.1](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.9.0...stryker-html-reporter@0.9.1) (2017-10-11)


### Bug Fixes

* **readme:** Remove old warning and update the example image ([#416](https://github.com/stryker-mutator/stryker/issues/416)) ([7e66214](https://github.com/stryker-mutator/stryker/commit/7e66214))




<a name="0.9.0"></a>
# [0.9.0](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.8.0...stryker-html-reporter@0.9.0) (2017-10-10)


### Features

* **html-report:** Revamp html report ([#399](https://github.com/stryker-mutator/stryker/issues/399)) ([5390d15](https://github.com/stryker-mutator/stryker/commit/5390d15)), closes [#386](https://github.com/stryker-mutator/stryker/issues/386) [#385](https://github.com/stryker-mutator/stryker/issues/385) [#383](https://github.com/stryker-mutator/stryker/issues/383)




<a name="0.8.0"></a>
# [0.8.0](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.7.2...stryker-html-reporter@0.8.0) (2017-09-19)


### Features

* **typescript:** Add support for TypeScript mutation testing (#376) ([ba78168](https://github.com/stryker-mutator/stryker/commit/ba78168))


### BREAKING CHANGES

* **typescript:** * Hoist the `Mutator` interface to a higher abstraction. With this interface it was possible to add mutators for specific ES5 AST nodes. As we're moving away from ES5, this plugin abstraction had to be hoisted to a higher level. It is no longer possible to plugin a specific ES5 node mutator.
* Update `report` interface: Rename `MutantState.Error` => `MutantState.RuntimeError`.




<a name="0.7.2"></a>
## [0.7.2](https://github.com/stryker-mutator/stryker/compare/stryker-html-reporter@0.7.1...stryker-html-reporter@0.7.2) (2017-09-09)


### Bug Fixes

* **one file directories:** Add support single file dirs ([#377](https://github.com/stryker-mutator/stryker/issues/377)) ([27c3e10](https://github.com/stryker-mutator/stryker/commit/27c3e10))




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
