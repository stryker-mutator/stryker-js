# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.6.1](https://github.com/stryker-mutator/stryker-js/compare/v5.6.0...v5.6.1) (2022-01-23)


### Bug Fixes

* **typescript cheker:** prevent unintentional declarationDir error ([#3358](https://github.com/stryker-mutator/stryker-js/issues/3358)) ([3b510e2](https://github.com/stryker-mutator/stryker-js/commit/3b510e2b28515d325d3583d500743064f5b156a7))





# [5.6.0](https://github.com/stryker-mutator/stryker-js/compare/v5.5.1...v5.6.0) (2022-01-09)


### Bug Fixes

* **tsconfig:** force declarationDir false for non-build projects ([#3313](https://github.com/stryker-mutator/stryker-js/issues/3313)) ([461f39c](https://github.com/stryker-mutator/stryker-js/commit/461f39cc0808dbab2ad405a96193aa4586f7f699))





## [5.5.1](https://github.com/stryker-mutator/stryker-js/compare/v5.5.0...v5.5.1) (2021-12-02)


### Bug Fixes

* **ts checker:** always disable `declarationMap` ([#3294](https://github.com/stryker-mutator/stryker-js/issues/3294)) ([990ecdc](https://github.com/stryker-mutator/stryker-js/commit/990ecdcf75ace7ad4553fd7c362d29d9bfa423ce))





# [5.5.0](https://github.com/stryker-mutator/stryker-js/compare/v5.4.1...v5.5.0) (2021-11-23)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





## [5.4.1](https://github.com/stryker-mutator/stryker-js/compare/v5.4.0...v5.4.1) (2021-09-30)


### Bug Fixes

* **typescript-checker:** support TS 4.4 ([#3178](https://github.com/stryker-mutator/stryker-js/issues/3178)) ([772e5bc](https://github.com/stryker-mutator/stryker-js/commit/772e5bcb126b4a44024921c31b760d57d92afd94))





# [5.4.0](https://github.com/stryker-mutator/stryker-js/compare/v5.3.0...v5.4.0) (2021-09-01)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [5.3.0](https://github.com/stryker-mutator/stryker-js/compare/v5.2.3...v5.3.0) (2021-08-07)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





## [5.2.3](https://github.com/stryker-mutator/stryker-js/compare/v5.2.2...v5.2.3) (2021-08-01)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





## [5.2.2](https://github.com/stryker-mutator/stryker-js/compare/v5.2.1...v5.2.2) (2021-07-13)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





## [5.2.1](https://github.com/stryker-mutator/stryker-js/compare/v5.2.0...v5.2.1) (2021-07-02)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [5.2.0](https://github.com/stryker-mutator/stryker-js/compare/v5.1.1...v5.2.0) (2021-07-02)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





## [5.1.1](https://github.com/stryker-mutator/stryker-js/compare/v5.1.0...v5.1.1) (2021-06-15)


### Bug Fixes

* **peerDeps:** update peer dependencies ([05733d2](https://github.com/stryker-mutator/stryker-js/commit/05733d260d5ffc9eb1b3e284bdc4bc8adafc4d38))





# [5.1.0](https://github.com/stryker-mutator/stryker-js/compare/v5.0.1...v5.1.0) (2021-06-14)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





## [5.0.1](https://github.com/stryker-mutator/stryker-js/compare/v5.0.0...v5.0.1) (2021-05-28)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [5.0.0](https://github.com/stryker-mutator/stryker-js/compare/v4.6.0...v5.0.0) (2021-05-14)


### Features

* **node:** Drop support for node 10 ([#2879](https://github.com/stryker-mutator/stryker-js/issues/2879)) ([dd29f88](https://github.com/stryker-mutator/stryker-js/commit/dd29f883d384fd29b86a0ef9f78808975657a001))
* **range:** remove Range from the API ([#2882](https://github.com/stryker-mutator/stryker-js/issues/2882)) ([b578b22](https://github.com/stryker-mutator/stryker-js/commit/b578b22eb9ccdd023602573d5d6e52c49bf99e0f)), closes [#322](https://github.com/stryker-mutator/stryker-js/issues/322)


### BREAKING CHANGES

* **range:** The `range` property is no longer present on a `mutant`. Note, this is a breaking change for plugin creators only.

Co-authored-by: Simon de Lang <simondelang@gmail.com>
* **node:** Node 10 is no longer supported. Please use Node 12 or higher.





# [4.6.0](https://github.com/stryker-mutator/stryker-js/compare/v4.5.1...v4.6.0) (2021-04-16)


### Features

* **rename:** rename to StrykerJS ([#2813](https://github.com/stryker-mutator/stryker-js/issues/2813)) ([dc08592](https://github.com/stryker-mutator/stryker-js/commit/dc08592c09c0fe5fcc21db03dc2da4e03713f46b)), closes [#2754](https://github.com/stryker-mutator/stryker-js/issues/2754)





## [4.5.1](https://github.com/stryker-mutator/stryker/compare/v4.5.0...v4.5.1) (2021-03-11)


### Bug Fixes

* **peer-deps:** use correct peer dep version ([a6ca0f2](https://github.com/stryker-mutator/stryker/commit/a6ca0f25b29cb84a2cb4b8c05a42e7305d5dde16))





# [4.5.0](https://github.com/stryker-mutator/stryker/compare/v4.4.1...v4.5.0) (2021-03-06)


### Bug Fixes

* **typescript-checker:** improve error reporting ([2502eba](https://github.com/stryker-mutator/stryker/commit/2502eba08b0c26c1b91cbd5917092ccd7a89aa7c))
* **typescript-checker:** resolve tsconfig files correctly ([8cf9e8c](https://github.com/stryker-mutator/stryker/commit/8cf9e8c43b7e3817452b32de9461829ed9ad6490))


### Features

* **package:** restructure package internals ([#2714](https://github.com/stryker-mutator/stryker/issues/2714)) ([e1711d2](https://github.com/stryker-mutator/stryker/commit/e1711d28f25e8ee7cbdf025adecb3234ee0515a6))





## [4.4.1](https://github.com/stryker-mutator/stryker/compare/v4.4.0...v4.4.1) (2021-01-27)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [4.4.0](https://github.com/stryker-mutator/stryker/compare/v4.3.1...v4.4.0) (2021-01-24)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





## [4.3.1](https://github.com/stryker-mutator/stryker/compare/v4.3.0...v4.3.1) (2020-12-25)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [4.3.0](https://github.com/stryker-mutator/stryker/compare/v4.2.0...v4.3.0) (2020-12-25)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [4.2.0](https://github.com/stryker-mutator/stryker/compare/v4.1.2...v4.2.0) (2020-12-09)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





## [4.1.2](https://github.com/stryker-mutator/stryker/compare/v4.1.1...v4.1.2) (2020-11-06)


### Bug Fixes

* **peerDeps:** update core in peerDependencies ([045dbc3](https://github.com/stryker-mutator/stryker/commit/045dbc3742c123658f4cf9ab2786b20ffd89a8cf))





## [4.1.1](https://github.com/stryker-mutator/stryker/compare/v4.1.0...v4.1.1) (2020-11-05)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [4.1.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0...v4.1.0) (2020-10-30)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [4.0.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.10...v4.0.0) (2020-10-07)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [4.0.0-beta.10](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.9...v4.0.0-beta.10) (2020-10-05)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [4.0.0-beta.9](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.8...v4.0.0-beta.9) (2020-09-30)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [4.0.0-beta.8](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.7...v4.0.0-beta.8) (2020-09-22)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [4.0.0-beta.7](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2020-09-17)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [4.0.0-beta.6](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2020-09-10)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [4.0.0-beta.5](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2020-09-09)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [4.0.0-beta.4](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2020-08-29)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [4.0.0-beta.3](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2020-08-19)


### Features

* **core:** strip comments in sandbox ([#2365](https://github.com/stryker-mutator/stryker/issues/2365)) ([55f27f2](https://github.com/stryker-mutator/stryker/commit/55f27f29b6994096c9aad038958ee93e9fa0f035)), closes [#2364](https://github.com/stryker-mutator/stryker/issues/2364)
* **test runner api:** remove `sandboxFileNames` injectable values ([#2369](https://github.com/stryker-mutator/stryker/issues/2369)) ([92f3bf5](https://github.com/stryker-mutator/stryker/commit/92f3bf528d0b01be1f6c219b37a5f90da0431686)), closes [#2351](https://github.com/stryker-mutator/stryker/issues/2351)





# [4.0.0-beta.2](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2020-08-07)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [4.0.0-beta.1](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2020-07-17)

**Note:** Version bump only for package @stryker-mutator/typescript-checker





# [4.0.0-beta.0](https://github.com/stryker-mutator/stryker/compare/v3.3.1...v4.0.0-beta.0) (2020-07-10)


### Bug Fixes

* **typescript-checker:** support empty files ([#2310](https://github.com/stryker-mutator/stryker/issues/2310)) ([284a28c](https://github.com/stryker-mutator/stryker/commit/284a28cbe831ad4c4ed161f2d700fa88663120ca))


### Features

* **core:** add support for checker plugins ([#2285](https://github.com/stryker-mutator/stryker/issues/2285)) ([69358e1](https://github.com/stryker-mutator/stryker/commit/69358e1423701c730e29d303119a08d74081f340))
* **tsconfig:** rewrite tsconfig references ([#2292](https://github.com/stryker-mutator/stryker/issues/2292)) ([4ee4950](https://github.com/stryker-mutator/stryker/commit/4ee4950bebd8db9c2f5a514edee57de55c040526)), closes [#2276](https://github.com/stryker-mutator/stryker/issues/2276)
* **typescript-checker:** a typescript type checker plugin ([#2241](https://github.com/stryker-mutator/stryker/issues/2241)) ([42adb95](https://github.com/stryker-mutator/stryker/commit/42adb9561cdd10172f955fda044854bcc1b7b515)), closes [/github.com/stryker-mutator/stryker/blob/f44008993a543dc3f38ca99516f56d315fdcb735/packages/typescript/src/transpiler/TranspilingLanguageService.ts#L23](https://github.com//github.com/stryker-mutator/stryker/blob/f44008993a543dc3f38ca99516f56d315fdcb735/packages/typescript/src/transpiler/TranspilingLanguageService.ts/issues/L23) [#391](https://github.com/stryker-mutator/stryker/issues/391)


### BREAKING CHANGES

* **core:** * `--maxConcurrentTestRunners` is now deprecated. Please use `--concurrency` instead.
