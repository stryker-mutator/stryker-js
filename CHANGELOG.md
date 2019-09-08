# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.1.0](https://github.com/stryker-mutator/stryker/compare/v2.0.2...v2.1.0) (2019-09-08)


### Features

* **mocha:** support mocha 6.2 ([feddcf1](https://github.com/stryker-mutator/stryker/commit/feddcf1))





## [2.0.2](https://github.com/stryker-mutator/stryker/compare/v2.0.1...v2.0.2) (2019-07-11)


### Bug Fixes

* **child process:** cleanup after dispose ([#1636](https://github.com/stryker-mutator/stryker/issues/1636)) ([3fd5db9](https://github.com/stryker-mutator/stryker/commit/3fd5db9))
* **child process proxy:** OutOfMemory detection ([#1635](https://github.com/stryker-mutator/stryker/issues/1635)) ([4324d9f](https://github.com/stryker-mutator/stryker/commit/4324d9f))
* **dispose:** fix race condition in dispose action ([124ef6a](https://github.com/stryker-mutator/stryker/commit/124ef6a)), closes [#1542](https://github.com/stryker-mutator/stryker/issues/1542)





## [2.0.1](https://github.com/stryker-mutator/stryker/compare/v2.0.0...v2.0.1) (2019-07-02)


### Bug Fixes

* **html:** set utf-8 charset ([#1592](https://github.com/stryker-mutator/stryker/issues/1592)) ([fb858ca](https://github.com/stryker-mutator/stryker/commit/fb858ca))
* **inquirer:** fix inquirer types ([#1563](https://github.com/stryker-mutator/stryker/issues/1563)) ([37ca23c](https://github.com/stryker-mutator/stryker/commit/37ca23c))





# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)


### Bug Fixes

* **vue:** only mutate Vue files with <script> blocks ([#1540](https://github.com/stryker-mutator/stryker/issues/1540)) ([ee4d27c](https://github.com/stryker-mutator/stryker/commit/ee4d27c))


### Features

* **deps:** update source-map dep to current major release ([45fa0f8](https://github.com/stryker-mutator/stryker/commit/45fa0f8))
* **es2017:** output es2017 code ([#1518](https://github.com/stryker-mutator/stryker/issues/1518)) ([e85561e](https://github.com/stryker-mutator/stryker/commit/e85561e))
* **formatting:** remove dependency on prettier ([#1552](https://github.com/stryker-mutator/stryker/issues/1552)) ([24543d3](https://github.com/stryker-mutator/stryker/commit/24543d3)), closes [#1261](https://github.com/stryker-mutator/stryker/issues/1261)
* **mocha:** deprecate mocha version 5 and below ([#1529](https://github.com/stryker-mutator/stryker/issues/1529)) ([1c55350](https://github.com/stryker-mutator/stryker/commit/1c55350))
* **node 6:** drop support for node 6 ([#1517](https://github.com/stryker-mutator/stryker/issues/1517)) ([801d7cd](https://github.com/stryker-mutator/stryker/commit/801d7cd))


### BREAKING CHANGES

* **es2017:** changed TypeScript output target from es5 to es2017. This requires a NodeJS runtime of version 8 or higher.
* **node 6:** support for Node 6 has been dropped. Node 8 or higher is now required.
* **mocha:** the use of mocha version 5 and below is deprecated. Please upgrade to mocha 6 or above. See [their changelog](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#600--2019-02-18) for more information about upgrading.





## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)


### Bug Fixes

* **clean up:** prevent sandbox creation after dispose ([#1527](https://github.com/stryker-mutator/stryker/issues/1527)) ([73fc0a8](https://github.com/stryker-mutator/stryker/commit/73fc0a8))





# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)


### Bug Fixes

* **dispose:** clean up child processes in alternative flows ([#1520](https://github.com/stryker-mutator/stryker/issues/1520)) ([31ee085](https://github.com/stryker-mutator/stryker/commit/31ee085))
* **html:** load report json from a js file ([#1485](https://github.com/stryker-mutator/stryker/issues/1485)) ([9bee2a7](https://github.com/stryker-mutator/stryker/commit/9bee2a7)), closes [#1482](https://github.com/stryker-mutator/stryker/issues/1482)


### Features

* **javascript-mutator:** allow decorators ([#1474](https://github.com/stryker-mutator/stryker/issues/1474)) ([f0dd430](https://github.com/stryker-mutator/stryker/commit/f0dd430))
* **mocha 6:** support all config formats ([#1511](https://github.com/stryker-mutator/stryker/issues/1511)) ([baa374d](https://github.com/stryker-mutator/stryker/commit/baa374d))





# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)


### Bug Fixes

* **deps:** add mutation-testing-report-schema ([3d40d91](https://github.com/stryker-mutator/stryker/commit/3d40d91))
* **typescript:** don't mutate `declare` statements ([#1458](https://github.com/stryker-mutator/stryker/issues/1458)) ([aae3afe](https://github.com/stryker-mutator/stryker/commit/aae3afe))


### Features

* **babel-transpiler:** support .js babel config files ([#1422](https://github.com/stryker-mutator/stryker/issues/1422)) ([9e321f0](https://github.com/stryker-mutator/stryker/commit/9e321f0))
* **html-reporter:** use mutation-testing-elements ([2f6df38](https://github.com/stryker-mutator/stryker/commit/2f6df38))
* **peer-dep:** update stryker core to v1.2 ([d798b19](https://github.com/stryker-mutator/stryker/commit/d798b19))
* **reporter:** add `mutationReportReady` event ([044158d](https://github.com/stryker-mutator/stryker/commit/044158d))
* **reporter:** implement `mutationTestReport` ([16ba76b](https://github.com/stryker-mutator/stryker/commit/16ba76b))





## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)


### Bug Fixes

* **broadcast-reporter:** log error detail ([#1461](https://github.com/stryker-mutator/stryker/issues/1461)) ([2331847](https://github.com/stryker-mutator/stryker/commit/2331847))





# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)


### Bug Fixes

* **duplicate files:** make transpile always result in unique file names ([#1405](https://github.com/stryker-mutator/stryker/issues/1405)) ([a3018d2](https://github.com/stryker-mutator/stryker/commit/a3018d2))
* **presets:** install v1.x dependencies instead of v0.x ([#1434](https://github.com/stryker-mutator/stryker/issues/1434)) ([7edda46](https://github.com/stryker-mutator/stryker/commit/7edda46))


### Features

* **jest-runner:** disable notifications ([#1419](https://github.com/stryker-mutator/stryker/issues/1419)) ([948166b](https://github.com/stryker-mutator/stryker/commit/948166b))





## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)


### Bug Fixes

* **jest-runner:** mark 'todo' tests as skipped ([#1420](https://github.com/stryker-mutator/stryker/issues/1420)) ([26d813f](https://github.com/stryker-mutator/stryker/commit/26d813f))





## [1.0.2](https://github.com/stryker-mutator/stryker/compare/v1.0.1...v1.0.2) (2019-02-13)


### Bug Fixes

* **stryker init:** update metadata for `stryker init` command ([#1403](https://github.com/stryker-mutator/stryker/issues/1403)) ([38f269b](https://github.com/stryker-mutator/stryker/commit/38f269b)), closes [#1402](https://github.com/stryker-mutator/stryker/issues/1402)





## [1.0.1](https://github.com/stryker-mutator/stryker/compare/v1.0.0...v1.0.1) (2019-02-13)


### Bug Fixes

* **api:** remove implicit typed inject dependency ([#1399](https://github.com/stryker-mutator/stryker/issues/1399)) ([5cae595](https://github.com/stryker-mutator/stryker/commit/5cae595))
