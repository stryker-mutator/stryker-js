# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.2.0](https://github.com/stryker-mutator/stryker/compare/v4.1.2...v4.2.0) (2020-12-09)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





## [4.1.2](https://github.com/stryker-mutator/stryker/compare/v4.1.1...v4.1.2) (2020-11-06)


### Bug Fixes

* **peerDeps:** update core in peerDependencies ([045dbc3](https://github.com/stryker-mutator/stryker/commit/045dbc3742c123658f4cf9ab2786b20ffd89a8cf))





## [4.1.1](https://github.com/stryker-mutator/stryker/compare/v4.1.0...v4.1.1) (2020-11-05)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [4.1.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0...v4.1.0) (2020-10-30)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [4.0.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.10...v4.0.0) (2020-10-07)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [4.0.0-beta.10](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.9...v4.0.0-beta.10) (2020-10-05)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [4.0.0-beta.9](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.8...v4.0.0-beta.9) (2020-09-30)


### Bug Fixes

* **config:** deprecate function based config ([#2499](https://github.com/stryker-mutator/stryker/issues/2499)) ([8ea3c18](https://github.com/stryker-mutator/stryker/commit/8ea3c18421929a0724ff99e5bf02ce0f174266cd))


### BREAKING CHANGES

* **config:** exporting a function from stryker.conf.js is deprecated. Please export your config as an object instead, or use a stryker.conf.json file.

Co-authored-by: Nico Jansen <jansennico@gmail.com>





# [4.0.0-beta.8](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.7...v4.0.0-beta.8) (2020-09-22)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [4.0.0-beta.7](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2020-09-17)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [4.0.0-beta.6](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2020-09-10)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [4.0.0-beta.5](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2020-09-09)


### Bug Fixes

* **jasmine-runner:** fix memory leaks ([457d807](https://github.com/stryker-mutator/stryker/commit/457d807989bd2a69a9e1b7bc33c3971a37c19737))





# [4.0.0-beta.4](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2020-08-29)


### Features

* **api:** rename test_runner2 -> test_runner ([#2442](https://github.com/stryker-mutator/stryker/issues/2442)) ([4d3ae97](https://github.com/stryker-mutator/stryker/commit/4d3ae9764dbd689c895b76e44f2eea76c82fabc8))
* **test-runner:** add `nrOfTests` metric ([0eea448](https://github.com/stryker-mutator/stryker/commit/0eea44892e2383e8b0a34c6267e2f455d604f55a))


### BREAKING CHANGES

* **api:** Plugin creators should now use `'test_runner'` instead of `'test_runner2'`.





# [4.0.0-beta.3](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2020-08-19)


### Features

* **test runner api:** remove `sandboxFileNames` injectable values ([#2369](https://github.com/stryker-mutator/stryker/issues/2369)) ([92f3bf5](https://github.com/stryker-mutator/stryker/commit/92f3bf528d0b01be1f6c219b37a5f90da0431686)), closes [#2351](https://github.com/stryker-mutator/stryker/issues/2351)





# [4.0.0-beta.2](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2020-08-07)


### Features

* **jest-runner:** support mutation switching ([#2350](https://github.com/stryker-mutator/stryker/issues/2350)) ([9e6e6e0](https://github.com/stryker-mutator/stryker/commit/9e6e6e077731344ed0588d64b5c8ba2f19c8492e))





# [4.0.0-beta.1](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2020-07-17)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [4.0.0-beta.0](https://github.com/stryker-mutator/stryker/compare/v3.3.1...v4.0.0-beta.0) (2020-07-10)


### Bug Fixes

* **jasmine-runner:** update deprecated api calls ([#2250](https://github.com/stryker-mutator/stryker/issues/2250)) ([b6d6dfd](https://github.com/stryker-mutator/stryker/commit/b6d6dfdabf8db748660b9818415864de27d55a7f))


### Features

* **jasmine-runner:** implement new test runner api ([#2256](https://github.com/stryker-mutator/stryker/issues/2256)) ([871db8c](https://github.com/stryker-mutator/stryker/commit/871db8c24c3389133d9b4476acd33b0ddd956a36)), closes [#2249](https://github.com/stryker-mutator/stryker/issues/2249)





## [3.3.1](https://github.com/stryker-mutator/stryker/compare/v3.3.0...v3.3.1) (2020-07-04)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [3.3.0](https://github.com/stryker-mutator/stryker/compare/v3.2.4...v3.3.0) (2020-06-16)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





## [3.2.4](https://github.com/stryker-mutator/stryker/compare/v3.2.3...v3.2.4) (2020-05-18)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





## [3.2.3](https://github.com/stryker-mutator/stryker/compare/v3.2.2...v3.2.3) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





## [3.2.2](https://github.com/stryker-mutator/stryker/compare/v3.2.1...v3.2.2) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





## [3.2.1](https://github.com/stryker-mutator/stryker/compare/v3.2.0...v3.2.1) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [3.2.0](https://github.com/stryker-mutator/stryker/compare/v3.1.0...v3.2.0) (2020-05-13)


### Features

* **validation:** add validation on plugin options ([#2158](https://github.com/stryker-mutator/stryker/issues/2158)) ([d78fe1e](https://github.com/stryker-mutator/stryker/commit/d78fe1e013ac2e309a29f0def3029492b1e6c1ea))






# [3.1.0](https://github.com/stryker-mutator/stryker/compare/v3.0.2...v3.1.0) (2020-03-29)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





## [3.0.2](https://github.com/stryker-mutator/stryker/compare/v3.0.1...v3.0.2) (2020-03-13)


### Bug Fixes

* **nodejs requirement:** set NodeJS requirement to at least Node 10 ([8c08059](https://github.com/stryker-mutator/stryker/commit/8c080594a87d638ea4349ee69e05ed6c7eba6463))





## [3.0.1](https://github.com/stryker-mutator/stryker/compare/v3.0.0...v3.0.1) (2020-03-12)


### Bug Fixes

* **Peer dependencies:** set peer dependencies for v3 ([#2096](https://github.com/stryker-mutator/stryker/issues/2096)) ([8648c4d](https://github.com/stryker-mutator/stryker/commit/8648c4d9c70ce032841371c6041ebb76bf099948)), closes [#2095](https://github.com/stryker-mutator/stryker/issues/2095)





# [3.0.0](https://github.com/stryker-mutator/stryker/compare/v2.5.0...v3.0.0) (2020-03-11)


### Bug Fixes

* **mocha:**  support mutants with "runAllTests" ([#2037](https://github.com/stryker-mutator/stryker/issues/2037)) ([a9da18a](https://github.com/stryker-mutator/stryker/commit/a9da18aa67845db943c5ce8ebd69b368b34e134e)), closes [#2032](https://github.com/stryker-mutator/stryker/issues/2032)


### Features

* **Initializer:** Initialize config file as JSON by default ([#2093](https://github.com/stryker-mutator/stryker/issues/2093)) ([e07d953](https://github.com/stryker-mutator/stryker/commit/e07d9535084881180d5abf7b58bece1b65f2455f)), closes [#2000](https://github.com/stryker-mutator/stryker/issues/2000)






# [2.5.0](https://github.com/stryker-mutator/stryker/compare/v2.4.0...v2.5.0) (2020-01-12)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [2.4.0](https://github.com/stryker-mutator/stryker/compare/v2.3.0...v2.4.0) (2019-11-24)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [2.3.0](https://github.com/stryker-mutator/stryker/compare/v2.2.1...v2.3.0) (2019-11-13)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





## [2.2.1](https://github.com/stryker-mutator/stryker/compare/v2.2.0...v2.2.1) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [2.2.0](https://github.com/stryker-mutator/stryker/compare/v2.1.0...v2.2.0) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [2.1.0](https://github.com/stryker-mutator/stryker/compare/v2.0.2...v2.1.0) (2019-09-08)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





## [2.0.2](https://github.com/stryker-mutator/stryker/compare/v2.0.1...v2.0.2) (2019-07-11)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





## [2.0.1](https://github.com/stryker-mutator/stryker/compare/v2.0.0...v2.0.1) (2019-07-02)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)


### Features

* **node 6:** drop support for node 6 ([#1517](https://github.com/stryker-mutator/stryker/issues/1517)) ([801d7cd](https://github.com/stryker-mutator/stryker/commit/801d7cd))


### BREAKING CHANGES

* **node 6:** support for Node 6 has been dropped. Node 8 or higher is now required.





## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





## [1.0.2](https://github.com/stryker-mutator/stryker/compare/v1.0.1...v1.0.2) (2019-02-13)


### Bug Fixes

* **stryker init:** update metadata for `stryker init` command ([#1403](https://github.com/stryker-mutator/stryker/issues/1403)) ([38f269b](https://github.com/stryker-mutator/stryker/commit/38f269b)), closes [#1402](https://github.com/stryker-mutator/stryker/issues/1402)





## [1.0.1](https://github.com/stryker-mutator/stryker/compare/v1.0.0...v1.0.1) (2019-02-13)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner





## [1.0.0](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.4.1...@stryker-mutator/jasmine-runner@1.0.0) (2019-02-13)


### Features

* **rename:** rename `stryker-xxx-xxx` -> `[@stryker-mutator](https://github.com/stryker-mutator)/xxx-xxx` ([1bbd6ff](https://github.com/stryker-mutator/stryker/commit/1bbd6ff))


### BREAKING CHANGES

* **rename:** The core package and plugins have been renamed: stryker-jasmine-runner -> @stryker-mutator/jasmine-runner





## [0.4.1](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.4.0...stryker-jasmine-runner@0.4.1) (2019-02-12)

**Note:** Version bump only for package stryker-jasmine-runner





# [0.4.0](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.3.0...stryker-jasmine-runner@0.4.0) (2019-02-08)


### Features

* **dependency injection:** Add dependency injection for plugins ([#1313](https://github.com/stryker-mutator/stryker/issues/1313)) ([f90cd56](https://github.com/stryker-mutator/stryker/commit/f90cd56)), closes [#667](https://github.com/stryker-mutator/stryker/issues/667)
* **port:** Deprecate property 'port' ([#1309](https://github.com/stryker-mutator/stryker/issues/1309)) ([2539ee0](https://github.com/stryker-mutator/stryker/commit/2539ee0))
* **test-runner:** Use new plugin system to load TestRunner plugins ([#1361](https://github.com/stryker-mutator/stryker/issues/1361)) ([266247b](https://github.com/stryker-mutator/stryker/commit/266247b))





<a name="0.3.0"></a>
# [0.3.0](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.2.9...stryker-jasmine-runner@0.3.0) (2018-12-23)


### Features

* **stryker-api:** Support stryker-api 0.23 ([#1293](https://github.com/stryker-mutator/stryker/issues/1293)) ([10720ad](https://github.com/stryker-mutator/stryker/commit/10720ad))




<a name="0.2.9"></a>
## [0.2.9](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.2.8...stryker-jasmine-runner@0.2.9) (2018-12-12)




**Note:** Version bump only for package stryker-jasmine-runner

<a name="0.2.8"></a>
## [0.2.8](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.2.7...stryker-jasmine-runner@0.2.8) (2018-11-29)


### Bug Fixes

* **stryker-api:** Update stryker-api peer dependency version ([677fc28](https://github.com/stryker-mutator/stryker/commit/677fc28))




<a name="0.2.7"></a>
## [0.2.7](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.2.6...stryker-jasmine-runner@0.2.7) (2018-11-29)




**Note:** Version bump only for package stryker-jasmine-runner

<a name="0.2.6"></a>
## [0.2.6](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.2.5...stryker-jasmine-runner@0.2.6) (2018-11-13)




**Note:** Version bump only for package stryker-jasmine-runner

<a name="0.2.5"></a>
## [0.2.5](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.2.3...stryker-jasmine-runner@0.2.5) (2018-10-15)


### Bug Fixes

* **version:** Version bump for failed release ([8cf9e87](https://github.com/stryker-mutator/stryker/commit/8cf9e87))




<a name="0.2.3"></a>
## [0.2.3](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.2.2...stryker-jasmine-runner@0.2.3) (2018-10-03)




**Note:** Version bump only for package stryker-jasmine-runner

<a name="0.2.2"></a>
## [0.2.2](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.2.1...stryker-jasmine-runner@0.2.2) (2018-09-14)




**Note:** Version bump only for package stryker-jasmine-runner

<a name="0.2.1"></a>
## [0.2.1](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.2.0...stryker-jasmine-runner@0.2.1) (2018-08-21)




**Note:** Version bump only for package stryker-jasmine-runner

<a name="0.2.0"></a>
# [0.2.0](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.1.2...stryker-jasmine-runner@0.2.0) (2018-08-19)


### Features

* **stryker config:** rename config setting `reporter` to `reporters` ([#1088](https://github.com/stryker-mutator/stryker/issues/1088)) ([584218a](https://github.com/stryker-mutator/stryker/commit/584218a)), closes [#793](https://github.com/stryker-mutator/stryker/issues/793)




<a name="0.1.2"></a>
## [0.1.2](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.1.1...stryker-jasmine-runner@0.1.2) (2018-08-17)


### Bug Fixes

* **dependencies:** support stryker-api 0.19.0 ([#1087](https://github.com/stryker-mutator/stryker/issues/1087)) ([44ce923](https://github.com/stryker-mutator/stryker/commit/44ce923))




<a name="0.1.1"></a>
## [0.1.1](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.1.0...stryker-jasmine-runner@0.1.1) (2018-08-17)




**Note:** Version bump only for package stryker-jasmine-runner

<a name="0.1.0"></a>
# [0.1.0](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.0.3...stryker-jasmine-runner@0.1.0) (2018-07-20)


### Bug Fixes

* **Dependencies:** Pin all deps on minor version ([#974](https://github.com/stryker-mutator/stryker/issues/974)) ([f0a7e5a](https://github.com/stryker-mutator/stryker/commit/f0a7e5a)), closes [#954](https://github.com/stryker-mutator/stryker/issues/954) [#967](https://github.com/stryker-mutator/stryker/issues/967)


### Features

* **logging:** Allow log to a file ([#954](https://github.com/stryker-mutator/stryker/issues/954)) ([c2f6b82](https://github.com/stryker-mutator/stryker/commit/c2f6b82)), closes [#748](https://github.com/stryker-mutator/stryker/issues/748)




<a name="0.0.3"></a>
## [0.0.3](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.0.2...stryker-jasmine-runner@0.0.3) (2018-07-04)




**Note:** Version bump only for package stryker-jasmine-runner

<a name="0.0.2"></a>
## [0.0.2](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.0.1...stryker-jasmine-runner@0.0.2) (2018-05-31)




**Note:** Version bump only for package stryker-jasmine-runner

<a name="0.0.1"></a>
## 0.0.1 (2018-05-21)




**Note:** Version bump only for package stryker-jasmine-runner
