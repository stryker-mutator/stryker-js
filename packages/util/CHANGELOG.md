# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.6.1](https://github.com/stryker-mutator/stryker-js/compare/v5.6.0...v5.6.1) (2022-01-23)

**Note:** Version bump only for package @stryker-mutator/util





# [5.6.0](https://github.com/stryker-mutator/stryker-js/compare/v5.5.1...v5.6.0) (2022-01-09)

**Note:** Version bump only for package @stryker-mutator/util





## [5.5.1](https://github.com/stryker-mutator/stryker-js/compare/v5.5.0...v5.5.1) (2021-12-02)

**Note:** Version bump only for package @stryker-mutator/util





# [5.5.0](https://github.com/stryker-mutator/stryker-js/compare/v5.4.1...v5.5.0) (2021-11-23)


### Bug Fixes

* **util:** clear require.cache behavior on case-insensitive file systems ([#3194](https://github.com/stryker-mutator/stryker-js/issues/3194)) ([39e3d86](https://github.com/stryker-mutator/stryker-js/commit/39e3d86238b29e5326b4f741f882cf3665200d1a))





## [5.4.1](https://github.com/stryker-mutator/stryker-js/compare/v5.4.0...v5.4.1) (2021-09-30)

**Note:** Version bump only for package @stryker-mutator/util





# [5.4.0](https://github.com/stryker-mutator/stryker-js/compare/v5.3.0...v5.4.0) (2021-09-01)

**Note:** Version bump only for package @stryker-mutator/util





# [5.3.0](https://github.com/stryker-mutator/stryker-js/compare/v5.2.3...v5.3.0) (2021-08-07)

**Note:** Version bump only for package @stryker-mutator/util





## [5.2.3](https://github.com/stryker-mutator/stryker-js/compare/v5.2.2...v5.2.3) (2021-08-01)

**Note:** Version bump only for package @stryker-mutator/util





## [5.2.2](https://github.com/stryker-mutator/stryker-js/compare/v5.2.1...v5.2.2) (2021-07-13)

**Note:** Version bump only for package @stryker-mutator/util





## [5.2.1](https://github.com/stryker-mutator/stryker-js/compare/v5.2.0...v5.2.1) (2021-07-02)

**Note:** Version bump only for package @stryker-mutator/util





# [5.2.0](https://github.com/stryker-mutator/stryker-js/compare/v5.1.1...v5.2.0) (2021-07-02)

**Note:** Version bump only for package @stryker-mutator/util





## [5.1.1](https://github.com/stryker-mutator/stryker-js/compare/v5.1.0...v5.1.1) (2021-06-15)

**Note:** Version bump only for package @stryker-mutator/util





# [5.1.0](https://github.com/stryker-mutator/stryker-js/compare/v5.0.1...v5.1.0) (2021-06-14)

**Note:** Version bump only for package @stryker-mutator/util





## [5.0.1](https://github.com/stryker-mutator/stryker-js/compare/v5.0.0...v5.0.1) (2021-05-28)

**Note:** Version bump only for package @stryker-mutator/util





# [5.0.0](https://github.com/stryker-mutator/stryker-js/compare/v4.6.0...v5.0.0) (2021-05-14)


### Features

* **serialize:** remove surrial ([#2877](https://github.com/stryker-mutator/stryker-js/issues/2877)) ([5114835](https://github.com/stryker-mutator/stryker-js/commit/51148357ed0103ebd6f60259d468bd34e535a4b3))


### BREAKING CHANGES

* **serialize:** Having a non-JSON-serializable value in your configuration won't be sent to the child process anymore. If you really need them in your test runner configuration, you should isolate those values and put them in test runner-specific config files, loaded by the test runner plugin itself, for example, jest.config.js, karma.conf.js, webpack.config.js.





# [4.6.0](https://github.com/stryker-mutator/stryker-js/compare/v4.5.1...v4.6.0) (2021-04-16)


### Features

* **rename:** rename to StrykerJS ([#2813](https://github.com/stryker-mutator/stryker-js/issues/2813)) ([dc08592](https://github.com/stryker-mutator/stryker-js/commit/dc08592c09c0fe5fcc21db03dc2da4e03713f46b)), closes [#2754](https://github.com/stryker-mutator/stryker-js/issues/2754)





## [4.5.1](https://github.com/stryker-mutator/stryker/compare/v4.5.0...v4.5.1) (2021-03-11)

**Note:** Version bump only for package @stryker-mutator/util





# [4.5.0](https://github.com/stryker-mutator/stryker/compare/v4.4.1...v4.5.0) (2021-03-06)


### Features

* **package:** restructure package internals ([#2714](https://github.com/stryker-mutator/stryker/issues/2714)) ([e1711d2](https://github.com/stryker-mutator/stryker/commit/e1711d28f25e8ee7cbdf025adecb3234ee0515a6))





## [4.4.1](https://github.com/stryker-mutator/stryker/compare/v4.4.0...v4.4.1) (2021-01-27)

**Note:** Version bump only for package @stryker-mutator/util





# [4.4.0](https://github.com/stryker-mutator/stryker/compare/v4.3.1...v4.4.0) (2021-01-24)

**Note:** Version bump only for package @stryker-mutator/util





## [4.3.1](https://github.com/stryker-mutator/stryker/compare/v4.3.0...v4.3.1) (2020-12-25)

**Note:** Version bump only for package @stryker-mutator/util





# [4.3.0](https://github.com/stryker-mutator/stryker/compare/v4.2.0...v4.3.0) (2020-12-25)

**Note:** Version bump only for package @stryker-mutator/util





# [4.2.0](https://github.com/stryker-mutator/stryker/compare/v4.1.2...v4.2.0) (2020-12-09)


### Features

* **karma-runner:** resolve local karma and ng version ([#2622](https://github.com/stryker-mutator/stryker/issues/2622)) ([5b92130](https://github.com/stryker-mutator/stryker/commit/5b921302787a526377be02a37eb43a487c8f283d))





## [4.1.2](https://github.com/stryker-mutator/stryker/compare/v4.1.1...v4.1.2) (2020-11-06)

**Note:** Version bump only for package @stryker-mutator/util





## [4.1.1](https://github.com/stryker-mutator/stryker/compare/v4.1.0...v4.1.1) (2020-11-05)

**Note:** Version bump only for package @stryker-mutator/util





# [4.1.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0...v4.1.0) (2020-10-30)

**Note:** Version bump only for package @stryker-mutator/util





# [4.0.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.10...v4.0.0) (2020-10-07)

**Note:** Version bump only for package @stryker-mutator/util





# [4.0.0-beta.10](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.9...v4.0.0-beta.10) (2020-10-05)

**Note:** Version bump only for package @stryker-mutator/util





# [4.0.0-beta.9](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.8...v4.0.0-beta.9) (2020-09-30)


### Bug Fixes

* **mutate config:** don't warn about files not existing at the default mutate location ([#2509](https://github.com/stryker-mutator/stryker/issues/2509)) ([66c2444](https://github.com/stryker-mutator/stryker/commit/66c24447e28c4218d3e58b945b1bcc5891855097)), closes [#2455](https://github.com/stryker-mutator/stryker/issues/2455)





# [4.0.0-beta.8](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.7...v4.0.0-beta.8) (2020-09-22)

**Note:** Version bump only for package @stryker-mutator/util





# [4.0.0-beta.7](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2020-09-17)

**Note:** Version bump only for package @stryker-mutator/util





# [4.0.0-beta.6](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2020-09-10)

**Note:** Version bump only for package @stryker-mutator/util





# [4.0.0-beta.5](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2020-09-09)


### Bug Fixes

* **mocha-runner:** fix memory leaks ([23eede2](https://github.com/stryker-mutator/stryker/commit/23eede22036c9efa502af8016e530af780a7cebb))


### Features

* **typescript:** Disable type checking ([#2446](https://github.com/stryker-mutator/stryker/issues/2446)) ([3ff996b](https://github.com/stryker-mutator/stryker/commit/3ff996b7516b7782434d86aa9aecbee334978a7f)), closes [#2438](https://github.com/stryker-mutator/stryker/issues/2438)





# [4.0.0-beta.4](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2020-08-29)

**Note:** Version bump only for package @stryker-mutator/util





# [4.0.0-beta.3](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2020-08-19)


### Features

* **test runner api:** remove `sandboxFileNames` injectable values ([#2369](https://github.com/stryker-mutator/stryker/issues/2369)) ([92f3bf5](https://github.com/stryker-mutator/stryker/commit/92f3bf528d0b01be1f6c219b37a5f90da0431686)), closes [#2351](https://github.com/stryker-mutator/stryker/issues/2351)





# [4.0.0-beta.2](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2020-08-07)

**Note:** Version bump only for package @stryker-mutator/util





# [4.0.0-beta.1](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2020-07-17)

**Note:** Version bump only for package @stryker-mutator/util





# [4.0.0-beta.0](https://github.com/stryker-mutator/stryker/compare/v3.3.1...v4.0.0-beta.0) (2020-07-10)


### Bug Fixes

* **karma-runner:** mocha filtering with `/` ([#2290](https://github.com/stryker-mutator/stryker/issues/2290)) ([3918633](https://github.com/stryker-mutator/stryker/commit/3918633b21ff37d2e950df2cc14b8557ee7eb6b3))


### Features

* **instrumenter:** add parsers ([#2222](https://github.com/stryker-mutator/stryker/issues/2222)) ([3b57ef2](https://github.com/stryker-mutator/stryker/commit/3b57ef23dd5b348dcdff205600989aea2c7fbcf0))
* **instrumenter:** add transformers ([#2234](https://github.com/stryker-mutator/stryker/issues/2234)) ([61c8fe6](https://github.com/stryker-mutator/stryker/commit/61c8fe65e35bb95b786a0e2bebbe57166ffbc480))





## [3.3.1](https://github.com/stryker-mutator/stryker/compare/v3.3.0...v3.3.1) (2020-07-04)

**Note:** Version bump only for package @stryker-mutator/util





# [3.3.0](https://github.com/stryker-mutator/stryker/compare/v3.2.4...v3.3.0) (2020-06-16)

**Note:** Version bump only for package @stryker-mutator/util





## [3.2.4](https://github.com/stryker-mutator/stryker/compare/v3.2.3...v3.2.4) (2020-05-18)

**Note:** Version bump only for package @stryker-mutator/util





## [3.2.3](https://github.com/stryker-mutator/stryker/compare/v3.2.2...v3.2.3) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/util





## [3.2.2](https://github.com/stryker-mutator/stryker/compare/v3.2.1...v3.2.2) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/util





## [3.2.1](https://github.com/stryker-mutator/stryker/compare/v3.2.0...v3.2.1) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/util





# [3.2.0](https://github.com/stryker-mutator/stryker/compare/v3.1.0...v3.2.0) (2020-05-13)


### Bug Fixes

* **utils:** make sure `instanceof StrykerError` works ([a9dea8c](https://github.com/stryker-mutator/stryker/commit/a9dea8c638a61bd472e937b69bf37846074e09a1))


### Features

* **validation:** add validation on plugin options ([#2158](https://github.com/stryker-mutator/stryker/issues/2158)) ([d78fe1e](https://github.com/stryker-mutator/stryker/commit/d78fe1e013ac2e309a29f0def3029492b1e6c1ea))
* **validation:** warn about unknown stryker config options ([#2164](https://github.com/stryker-mutator/stryker/issues/2164)) ([8c6fd97](https://github.com/stryker-mutator/stryker/commit/8c6fd972dc57e246d361132dc176920d380c91cc)), closes [#2103](https://github.com/stryker-mutator/stryker/issues/2103)






# [3.1.0](https://github.com/stryker-mutator/stryker/compare/v3.0.2...v3.1.0) (2020-03-29)

**Note:** Version bump only for package @stryker-mutator/util





## [3.0.2](https://github.com/stryker-mutator/stryker/compare/v3.0.1...v3.0.2) (2020-03-13)

**Note:** Version bump only for package @stryker-mutator/util





## [3.0.1](https://github.com/stryker-mutator/stryker/compare/v3.0.0...v3.0.1) (2020-03-12)

**Note:** Version bump only for package @stryker-mutator/util





# [3.0.0](https://github.com/stryker-mutator/stryker/compare/v2.5.0...v3.0.0) (2020-03-11)


### Features

* **promisified fs:** use node 10 promisified functions ([#2028](https://github.com/stryker-mutator/stryker/issues/2028)) ([1c57d8f](https://github.com/stryker-mutator/stryker/commit/1c57d8f4620c2392e167f45fa20aa6acbd0c7a7d))


### BREAKING CHANGES

* **promisified fs:** removed fsAsPromised from @stryker-mutator/util






# [2.5.0](https://github.com/stryker-mutator/stryker/compare/v2.4.0...v2.5.0) (2020-01-12)


### Features

* **.gitignore:** add Stryker patterns to .gitignore file during initialization ([#1848](https://github.com/stryker-mutator/stryker/issues/1848)) ([854aee0](https://github.com/stryker-mutator/stryker/commit/854aee0))





# [2.4.0](https://github.com/stryker-mutator/stryker/compare/v2.3.0...v2.4.0) (2019-11-24)

**Note:** Version bump only for package @stryker-mutator/util





# [2.3.0](https://github.com/stryker-mutator/stryker/compare/v2.2.1...v2.3.0) (2019-11-13)

**Note:** Version bump only for package @stryker-mutator/util





## [2.2.1](https://github.com/stryker-mutator/stryker/compare/v2.2.0...v2.2.1) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/util





# [2.2.0](https://github.com/stryker-mutator/stryker/compare/v2.1.0...v2.2.0) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/util





# [2.1.0](https://github.com/stryker-mutator/stryker/compare/v2.0.2...v2.1.0) (2019-09-08)

**Note:** Version bump only for package @stryker-mutator/util





## [2.0.2](https://github.com/stryker-mutator/stryker/compare/v2.0.1...v2.0.2) (2019-07-11)

**Note:** Version bump only for package @stryker-mutator/util





## [2.0.1](https://github.com/stryker-mutator/stryker/compare/v2.0.0...v2.0.1) (2019-07-02)

**Note:** Version bump only for package @stryker-mutator/util





# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)

**Note:** Version bump only for package @stryker-mutator/util





## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)

**Note:** Version bump only for package @stryker-mutator/util





# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)

**Note:** Version bump only for package @stryker-mutator/util





# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)

**Note:** Version bump only for package @stryker-mutator/util





## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)

**Note:** Version bump only for package @stryker-mutator/util





# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)

**Note:** Version bump only for package @stryker-mutator/util





## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)

**Note:** Version bump only for package @stryker-mutator/util





# [0.1.0](https://github.com/stryker-mutator/stryker/compare/@stryker-mutator/util@0.0.3...@stryker-mutator/util@0.1.0) (2019-02-08)


### Features

* **dependency injection:** Add dependency injection for plugins ([#1313](https://github.com/stryker-mutator/stryker/issues/1313)) ([f90cd56](https://github.com/stryker-mutator/stryker/commit/f90cd56)), closes [#667](https://github.com/stryker-mutator/stryker/issues/667)





<a name="0.0.3"></a>
## [0.0.3](https://github.com/stryker-mutator/stryker/compare/@stryker-mutator/util@0.0.2...@stryker-mutator/util@0.0.3) (2018-11-13)




**Note:** Version bump only for package @stryker-mutator/util

<a name="0.0.2"></a>
## [0.0.2](https://github.com/stryker-mutator/stryker/compare/@stryker-mutator/util@0.0.1...@stryker-mutator/util@0.0.2) (2018-11-07)




**Note:** Version bump only for package @stryker-mutator/util

<a name="0.0.1"></a>
## 0.0.1 (2018-10-15)


### Bug Fixes

* **any-promise:** Don't register a promise implementation ([#1180](https://github.com/stryker-mutator/stryker/issues/1180)) ([1d3e2f6](https://github.com/stryker-mutator/stryker/commit/1d3e2f6))
