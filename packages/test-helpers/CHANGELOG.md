# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [8.0.0](https://github.com/stryker-mutator/stryker-js/compare/v7.3.0...v8.0.0) (2023-11-30)

### Bug Fixes

- **deps:** update mutation-testing-elements monorepo to v2.0.5 ([#4536](https://github.com/stryker-mutator/stryker-js/issues/4536)) ([45e3ae6](https://github.com/stryker-mutator/stryker-js/commit/45e3ae62427ea59dd5ddd42016ecf93b6ecf7e44))

### Features

- **vitest:** support browser mode ([#4628](https://github.com/stryker-mutator/stryker-js/issues/4628)) ([3d02969](https://github.com/stryker-mutator/stryker-js/commit/3d0296914e455fd3a1fa754ffa4711368af036c0))

# [7.3.0](https://github.com/stryker-mutator/stryker-js/compare/v7.2.0...v7.3.0) (2023-10-15)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [7.2.0](https://github.com/stryker-mutator/stryker-js/compare/v7.1.1...v7.2.0) (2023-10-02)

### Bug Fixes

- **deps:** update mutation-testing-elements monorepo to v2.0.3 ([#4399](https://github.com/stryker-mutator/stryker-js/issues/4399)) ([2aa1f54](https://github.com/stryker-mutator/stryker-js/commit/2aa1f542f738512899ead0304200fc0c48250892))

## [7.1.1](https://github.com/stryker-mutator/stryker-js/compare/v7.1.0...v7.1.1) (2023-07-15)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [7.1.0](https://github.com/stryker-mutator/stryker-js/compare/v7.0.2...v7.1.0) (2023-06-24)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [7.0.2](https://github.com/stryker-mutator/stryker-js/compare/v7.0.1...v7.0.2) (2023-06-08)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [7.0.1](https://github.com/stryker-mutator/stryker-js/compare/v7.0.0...v7.0.1) (2023-06-03)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [7.0.0](https://github.com/stryker-mutator/stryker-js/compare/v6.4.2...v7.0.0) (2023-06-02)

### Bug Fixes

- **deps:** update mutation-testing-elements monorepo to v2.0.1 ([#4182](https://github.com/stryker-mutator/stryker-js/issues/4182)) ([c1b7312](https://github.com/stryker-mutator/stryker-js/commit/c1b7312a238b67f43630101b084ff33780eda1c5))
- **deps:** update mutation-testing-metrics and mutation-report-schema to v2 ([#4154](https://github.com/stryker-mutator/stryker-js/issues/4154)) ([9b77a3f](https://github.com/stryker-mutator/stryker-js/commit/9b77a3f6fdeb7036b1e15610f03dd8c85a502670))

### chore

- **esm:** use "exports" and module "Node16" ([#4171](https://github.com/stryker-mutator/stryker-js/issues/4171)) ([cdf4a34](https://github.com/stryker-mutator/stryker-js/commit/cdf4a342b73d922423eb46a919eb3b38c4c43c46))

### Features

- **reporter-api:** remove `onAllMutantsTested` ([#4234](https://github.com/stryker-mutator/stryker-js/issues/4234)) ([762c023](https://github.com/stryker-mutator/stryker-js/commit/762c023e5ac0ae6e2967be0458663c41d31e82ea))
- **vitest:** support vitest test runner ([7394e95](https://github.com/stryker-mutator/stryker-js/commit/7394e95ff27361c39755a60b53ba0839080cadfc))

### BREAKING CHANGES

- **reporter-api:** The event `onAllMutantsTested` has been removed. Plugin creators should use `onMutationTestReportReady` instead.
- **esm:** Deep (and undocumented) imports from `@stryker-mutator/core` or one of the plugins will no longer work. If you want to import something that's not available, please let us know by [opening an issue](https://github.com/stryker-mutator/stryker-js/issues/new/choose)

## [6.4.2](https://github.com/stryker-mutator/stryker-js/compare/v6.4.1...v6.4.2) (2023-03-24)

### Bug Fixes

- **progress reporter:** improve ETC prediction ([#4024](https://github.com/stryker-mutator/stryker-js/issues/4024)) ([956bbe9](https://github.com/stryker-mutator/stryker-js/commit/956bbe9a7ae3afb2e339f9027fe553c428c0c195)), closes [#4018](https://github.com/stryker-mutator/stryker-js/issues/4018)

## [6.4.1](https://github.com/stryker-mutator/stryker-js/compare/v6.4.0...v6.4.1) (2023-02-17)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [6.4.0](https://github.com/stryker-mutator/stryker-js/compare/v6.3.1...v6.4.0) (2023-02-17)

### Bug Fixes

- **deps:** update dependency mutation-testing-metrics to v1.7.14 ([#3970](https://github.com/stryker-mutator/stryker-js/issues/3970)) ([ddf32ee](https://github.com/stryker-mutator/stryker-js/commit/ddf32ee7581cc6169390022f933f593b7049bd3e))

## [6.3.1](https://github.com/stryker-mutator/stryker-js/compare/v6.3.0...v6.3.1) (2022-12-18)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [6.3.0](https://github.com/stryker-mutator/stryker-js/compare/v6.2.3...v6.3.0) (2022-10-30)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [6.2.3](https://github.com/stryker-mutator/stryker-js/compare/v6.2.2...v6.2.3) (2022-10-10)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [6.2.2](https://github.com/stryker-mutator/stryker-js/compare/v6.2.1...v6.2.2) (2022-09-06)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [6.2.1](https://github.com/stryker-mutator/stryker-js/compare/v6.2.0...v6.2.1) (2022-09-06)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [6.2.0](https://github.com/stryker-mutator/stryker-js/compare/v6.1.2...v6.2.0) (2022-09-06)

### Features

- **incremental:** add incremental mode ([#3609](https://github.com/stryker-mutator/stryker-js/issues/3609)) ([82bea56](https://github.com/stryker-mutator/stryker-js/commit/82bea5604c81c1ccf76d44827ad3922cfb61463b))

# [6.2.0-beta.0](https://github.com/stryker-mutator/stryker-js/compare/v6.1.2...v6.2.0-beta.0) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [6.1.2](https://github.com/stryker-mutator/stryker-js/compare/v6.1.1...v6.1.2) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [6.1.1](https://github.com/stryker-mutator/stryker-js/compare/v6.1.0...v6.1.1) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [6.1.0](https://github.com/stryker-mutator/stryker-js/compare/v6.0.2...v6.1.0) (2022-06-27)

- feat(cucumber): support native esm (#3596) ([4eaf713](https://github.com/stryker-mutator/stryker-js/commit/4eaf7136db5d704fc70a646b53a3946eb42743d5)), closes [#3596](https://github.com/stryker-mutator/stryker-js/issues/3596)

### Features

- **plugin:** allow fileDescriptions to be injected ([#3582](https://github.com/stryker-mutator/stryker-js/issues/3582)) ([fa2b77e](https://github.com/stryker-mutator/stryker-js/commit/fa2b77e3572884f44329e3f03b9201e9fd37082c))

### BREAKING CHANGES

- The `@stryker-mutator/cucumber-runner` now requires `@cucumber/cucumber` v8 or up.

## [6.0.2](https://github.com/stryker-mutator/stryker-js/compare/v6.0.1...v6.0.2) (2022-05-05)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [6.0.1](https://github.com/stryker-mutator/stryker-js/compare/v6.0.0...v6.0.1) (2022-05-04)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [6.0.0](https://github.com/stryker-mutator/stryker-js/compare/v6.0.0-beta.0...v6.0.0) (2022-05-03)

### Bug Fixes

- **core:** allow parallel schedules ([#3485](https://github.com/stryker-mutator/stryker-js/issues/3485)) ([bbbd514](https://github.com/stryker-mutator/stryker-js/commit/bbbd51424ee03a0df08c915fbfdfbacd1d733f0e))

### Code Refactoring

- **file:** move `File` from `api` to `util` ([#3489](https://github.com/stryker-mutator/stryker-js/issues/3489)) ([ac4bcca](https://github.com/stryker-mutator/stryker-js/commit/ac4bcca133930a046e0abf28abad24a5af1dbd22))

### Features

- **progress:** improve progressbar ETC estimate ([#3469](https://github.com/stryker-mutator/stryker-js/issues/3469)) ([ec63d93](https://github.com/stryker-mutator/stryker-js/commit/ec63d9397a0cf23e5fb91b9f6e3ae68ab2d3b2e0))
- **warn slow:** warn users for slow runs ([#3490](https://github.com/stryker-mutator/stryker-js/issues/3490)) ([1103958](https://github.com/stryker-mutator/stryker-js/commit/1103958c02fc32a1131c2ad6504bee892c250261))

### BREAKING CHANGES

- **file:** The `File` class is no longer part of the public api and is thus no longer exported from `@stryker-mutator/api`. Plugin creators shouldn't rely on it anymore.
- **progress:** Reporter API method `onAllMutantsMatchedWithTests` has been replaced by `onMutationTestingPlanReady`. Please use that for your reporter plugin instead.
- **progress:** Reporter API method `onAllSourceFilesRead` has been removed, please use `onMutationTestReportReady` to retrieve the source files.
- **progress:** Reporter API method `onSourceFileRead` has been removed, please use `onMutationTestReportReady` to retrieve the source files.

# [6.0.0-beta.0](https://github.com/stryker-mutator/stryker-js/compare/v5.6.1...v6.0.0-beta.0) (2022-03-02)

### Features

- **esm:** migrate StrykerJS to pure ESM ([#3409](https://github.com/stryker-mutator/stryker-js/issues/3409)) ([78c305e](https://github.com/stryker-mutator/stryker-js/commit/78c305e2c2271fedb54bfff3d34aa6b70b421b3a))
- **esm:** support esm in the mocha runner ([#3393](https://github.com/stryker-mutator/stryker-js/issues/3393)) ([2eb3504](https://github.com/stryker-mutator/stryker-js/commit/2eb35042da4e78021dcf54ac71c22f97eb91ff70)), closes [#2413](https://github.com/stryker-mutator/stryker-js/issues/2413) [#2413](https://github.com/stryker-mutator/stryker-js/issues/2413)
- **ignore static:** allow to ignore static mutants ([#3284](https://github.com/stryker-mutator/stryker-js/issues/3284)) ([75d9b79](https://github.com/stryker-mutator/stryker-js/commit/75d9b792e04dbafaaaff88c3994cf1a1e456610b))
- **ignore static:** prevent leak of hybrid mutants ([#3443](https://github.com/stryker-mutator/stryker-js/issues/3443)) ([231049a](https://github.com/stryker-mutator/stryker-js/commit/231049a32f73083c7579b1bf8b4424ad309f655d))
- **reload test environment:** implement test environment reload ([#3369](https://github.com/stryker-mutator/stryker-js/issues/3369)) ([b95b907](https://github.com/stryker-mutator/stryker-js/commit/b95b907e54d3a114731a8bcf659a1910df4e4f0b))

### BREAKING CHANGES

- **esm:** StrykerJS is now a pure ESM. Please [read this](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
- **esm:** Node 12.20 is now the min version.
- **esm:** Karma v6.3 is now the min supported karma version for `@stryker-mutator/karma-runner`, since [that version added support for async config loading](https://github.com/karma-runner/karma/blob/master/CHANGELOG.md#630-2021-03-23)
- **esm:** The `@stryker-mutator/mocha-runner` now requires `mocha@7.2` or higher.
- **reload test environment:** Test runner plugins must provide `TestRunnerCapabilities` by implementing the `capabilities` method.

## [5.6.1](https://github.com/stryker-mutator/stryker-js/compare/v5.6.0...v5.6.1) (2022-01-23)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [5.6.0](https://github.com/stryker-mutator/stryker-js/compare/v5.5.1...v5.6.0) (2022-01-09)

### Bug Fixes

- **report:** dramatically improve rendering performance of HTML report ([ad38c82](https://github.com/stryker-mutator/stryker-js/commit/ad38c8219ab5cd6dc477b67bf3416c9afdfba972))

## [5.5.1](https://github.com/stryker-mutator/stryker-js/compare/v5.5.0...v5.5.1) (2021-12-02)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [5.5.0](https://github.com/stryker-mutator/stryker-js/compare/v5.4.1...v5.5.0) (2021-11-23)

### Features

- **html:** new diff-view when selecting mutants ([#3263](https://github.com/stryker-mutator/stryker-js/issues/3263)) ([8b253ee](https://github.com/stryker-mutator/stryker-js/commit/8b253ee8ed92d447b5f854e4250f8e1fd064cd13))

## [5.4.1](https://github.com/stryker-mutator/stryker-js/compare/v5.4.0...v5.4.1) (2021-09-30)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [5.4.0](https://github.com/stryker-mutator/stryker-js/compare/v5.3.0...v5.4.0) (2021-09-01)

### Features

- **test runner:** Support for disable bail ([#3074](https://github.com/stryker-mutator/stryker-js/issues/3074)) ([0962232](https://github.com/stryker-mutator/stryker-js/commit/0962232fe2a181a2fde0067ed95f99885b8cee28))

# [5.3.0](https://github.com/stryker-mutator/stryker-js/compare/v5.2.3...v5.3.0) (2021-08-07)

### Features

- **report:** show status reason in the html report. ([d777e49](https://github.com/stryker-mutator/stryker-js/commit/d777e49639a2161abc9f9708157409163603874a))

## [5.2.3](https://github.com/stryker-mutator/stryker-js/compare/v5.2.2...v5.2.3) (2021-08-01)

### Bug Fixes

- **karma runner:** restart a browser on disconnect error ([#3020](https://github.com/stryker-mutator/stryker-js/issues/3020)) ([fc5c449](https://github.com/stryker-mutator/stryker-js/commit/fc5c449ba329d7a8b07d47193d4916cb28d47bb1))

## [5.2.2](https://github.com/stryker-mutator/stryker-js/compare/v5.2.1...v5.2.2) (2021-07-13)

### Bug Fixes

- **schema:** Resolve "No 'exports' main" error ([#3004](https://github.com/stryker-mutator/stryker-js/issues/3004)) ([9034806](https://github.com/stryker-mutator/stryker-js/commit/90348066bf3341a669cad67070a61f9dfd58f522))

## [5.2.1](https://github.com/stryker-mutator/stryker-js/compare/v5.2.0...v5.2.1) (2021-07-02)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [5.2.0](https://github.com/stryker-mutator/stryker-js/compare/v5.1.1...v5.2.0) (2021-07-02)

### Features

- **🥒:** add support for cucumber-js test runner ([#2970](https://github.com/stryker-mutator/stryker-js/issues/2970)) ([86d6f79](https://github.com/stryker-mutator/stryker-js/commit/86d6f7998aeb2e0e2265480fd3f75d703e39b3dc))

## [5.1.1](https://github.com/stryker-mutator/stryker-js/compare/v5.1.0...v5.1.1) (2021-06-15)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [5.1.0](https://github.com/stryker-mutator/stryker-js/compare/v5.0.1...v5.1.0) (2021-06-14)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [5.0.1](https://github.com/stryker-mutator/stryker-js/compare/v5.0.0...v5.0.1) (2021-05-28)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [5.0.0](https://github.com/stryker-mutator/stryker-js/compare/v4.6.0...v5.0.0) (2021-05-14)

### Features

- **range:** remove Range from the API ([#2882](https://github.com/stryker-mutator/stryker-js/issues/2882)) ([b578b22](https://github.com/stryker-mutator/stryker-js/commit/b578b22eb9ccdd023602573d5d6e52c49bf99e0f)), closes [#322](https://github.com/stryker-mutator/stryker-js/issues/322)
- **report:** report test states ([#2868](https://github.com/stryker-mutator/stryker-js/issues/2868)) ([e84aa88](https://github.com/stryker-mutator/stryker-js/commit/e84aa8849d6746ebaa22005423f6f461a67df0a9))
- **reporter api:** unify reporter api with mutation-testing-elements ([#2798](https://github.com/stryker-mutator/stryker-js/issues/2798)) ([d173b27](https://github.com/stryker-mutator/stryker-js/commit/d173b27117ade43e86a991643207532e338e7907)), closes [#2766](https://github.com/stryker-mutator/stryker-js/issues/2766)
- **serialize:** remove surrial ([#2877](https://github.com/stryker-mutator/stryker-js/issues/2877)) ([5114835](https://github.com/stryker-mutator/stryker-js/commit/51148357ed0103ebd6f60259d468bd34e535a4b3))

### BREAKING CHANGES

- **range:** The `range` property is no longer present on a `mutant`. Note, this is a breaking change for plugin creators only.

Co-authored-by: Simon de Lang <simondelang@gmail.com>

- **serialize:** Having a non-JSON-serializable value in your configuration won't be sent to the child process anymore. If you really need them in your test runner configuration, you should isolate those values and put them in test runner-specific config files, loaded by the test runner plugin itself, for example, jest.config.js, karma.conf.js, webpack.config.js.
- **reporter api:** Changes to `Reporter` and `TestRunner` plugin API of Stryker

# [4.6.0](https://github.com/stryker-mutator/stryker-js/compare/v4.5.1...v4.6.0) (2021-04-16)

### Features

- **rename:** rename to StrykerJS ([#2813](https://github.com/stryker-mutator/stryker-js/issues/2813)) ([dc08592](https://github.com/stryker-mutator/stryker-js/commit/dc08592c09c0fe5fcc21db03dc2da4e03713f46b)), closes [#2754](https://github.com/stryker-mutator/stryker-js/issues/2754)

## [4.5.1](https://github.com/stryker-mutator/stryker/compare/v4.5.0...v4.5.1) (2021-03-11)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [4.5.0](https://github.com/stryker-mutator/stryker/compare/v4.4.1...v4.5.0) (2021-03-06)

### Features

- **package:** restructure package internals ([#2714](https://github.com/stryker-mutator/stryker/issues/2714)) ([e1711d2](https://github.com/stryker-mutator/stryker/commit/e1711d28f25e8ee7cbdf025adecb3234ee0515a6))

## [4.4.1](https://github.com/stryker-mutator/stryker/compare/v4.4.0...v4.4.1) (2021-01-27)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [4.4.0](https://github.com/stryker-mutator/stryker/compare/v4.3.1...v4.4.0) (2021-01-24)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [4.3.1](https://github.com/stryker-mutator/stryker/compare/v4.3.0...v4.3.1) (2020-12-25)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [4.3.0](https://github.com/stryker-mutator/stryker/compare/v4.2.0...v4.3.0) (2020-12-25)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [4.2.0](https://github.com/stryker-mutator/stryker/compare/v4.1.2...v4.2.0) (2020-12-09)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [4.1.2](https://github.com/stryker-mutator/stryker/compare/v4.1.1...v4.1.2) (2020-11-06)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [4.1.1](https://github.com/stryker-mutator/stryker/compare/v4.1.0...v4.1.1) (2020-11-05)

### Bug Fixes

- **ts:** support es private fields ([#2605](https://github.com/stryker-mutator/stryker/issues/2605)) ([6bd2fbb](https://github.com/stryker-mutator/stryker/commit/6bd2fbbf0aaa5154930ce36f4d153ee91a3c5f1f))

# [4.1.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0...v4.1.0) (2020-10-30)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [4.0.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.10...v4.0.0) (2020-10-07)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [4.0.0-beta.10](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.9...v4.0.0-beta.10) (2020-10-05)

### Features

- **instrumenter:** add excludedMutations support ([#2513](https://github.com/stryker-mutator/stryker/issues/2513)) ([bfd714f](https://github.com/stryker-mutator/stryker/commit/bfd714fe1b4f9c3b2468164a95d0c5bd0cbc8fcf))

# [4.0.0-beta.9](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.8...v4.0.0-beta.9) (2020-09-30)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [4.0.0-beta.8](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.7...v4.0.0-beta.8) (2020-09-22)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [4.0.0-beta.7](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2020-09-17)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [4.0.0-beta.6](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2020-09-10)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [4.0.0-beta.5](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2020-09-09)

### Features

- **typescript:** Disable type checking ([#2446](https://github.com/stryker-mutator/stryker/issues/2446)) ([3ff996b](https://github.com/stryker-mutator/stryker/commit/3ff996b7516b7782434d86aa9aecbee334978a7f)), closes [#2438](https://github.com/stryker-mutator/stryker/issues/2438)

# [4.0.0-beta.4](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2020-08-29)

### Bug Fixes

- **input files:** support emojis in file names ([#2430](https://github.com/stryker-mutator/stryker/issues/2430)) ([139f9f3](https://github.com/stryker-mutator/stryker/commit/139f9f3ea9aa2349198cb824ceb444f7c6b013b6))

### Features

- **api:** rename test_runner2 -> test_runner ([#2442](https://github.com/stryker-mutator/stryker/issues/2442)) ([4d3ae97](https://github.com/stryker-mutator/stryker/commit/4d3ae9764dbd689c895b76e44f2eea76c82fabc8))
- **options:** deprecate old stryker options ([#2395](https://github.com/stryker-mutator/stryker/issues/2395)) ([7c637c8](https://github.com/stryker-mutator/stryker/commit/7c637c8714169a03facd42a7521f7670b7606a32))
- **reporter-api:** support mutation switching ([67f1ed5](https://github.com/stryker-mutator/stryker/commit/67f1ed52f4d17df4306362064180d267ed5445c7))

### BREAKING CHANGES

- **api:** Plugin creators should now use `'test_runner'` instead of `'test_runner2'`.
- **reporter-api:** The `onMutantTested` and `onAllMutantsTested` methods on the `Reporter` api have changed

# [4.0.0-beta.3](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2020-08-19)

### Bug Fixes

- **core:** exit process on error ([#2378](https://github.com/stryker-mutator/stryker/issues/2378)) ([af18a59](https://github.com/stryker-mutator/stryker/commit/af18a590fc916d75d54bcfaf2dda1d6a90bd4df8)), closes [#2315](https://github.com/stryker-mutator/stryker/issues/2315)

### Features

- **core:** add ability to override file headers ([#2363](https://github.com/stryker-mutator/stryker/issues/2363)) ([430d6d3](https://github.com/stryker-mutator/stryker/commit/430d6d3d17fe2ad8e2cef3b858afa7efb86c2342))
- **test runner api:** remove `sandboxFileNames` injectable values ([#2369](https://github.com/stryker-mutator/stryker/issues/2369)) ([92f3bf5](https://github.com/stryker-mutator/stryker/commit/92f3bf528d0b01be1f6c219b37a5f90da0431686)), closes [#2351](https://github.com/stryker-mutator/stryker/issues/2351)

# [4.0.0-beta.2](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2020-08-07)

### Features

- **command:** Support command test runner with mutation switching ([#2345](https://github.com/stryker-mutator/stryker/issues/2345)) ([59b1cfc](https://github.com/stryker-mutator/stryker/commit/59b1cfc06c4f8f5ec1e55dce4823e0f9c384b16c))
- **jest-runner:** support mutation switching ([#2350](https://github.com/stryker-mutator/stryker/issues/2350)) ([9e6e6e0](https://github.com/stryker-mutator/stryker/commit/9e6e6e077731344ed0588d64b5c8ba2f19c8492e))

# [4.0.0-beta.1](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2020-07-17)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [4.0.0-beta.0](https://github.com/stryker-mutator/stryker/compare/v3.3.1...v4.0.0-beta.0) (2020-07-10)

### Features

- **api:** add id to Mutant interface ([#2255](https://github.com/stryker-mutator/stryker/issues/2255)) ([cfc9053](https://github.com/stryker-mutator/stryker/commit/cfc90537d0b9815cba2b44b9681d171ca602766e))
- **api:** remove support for options editors ([5e56d0e](https://github.com/stryker-mutator/stryker/commit/5e56d0ea6982faf11048c8ca4bbb912ee17e88eb))
- **checker:** add checker api ([#2240](https://github.com/stryker-mutator/stryker/issues/2240)) ([d463f86](https://github.com/stryker-mutator/stryker/commit/d463f8639437c114da4fe30115652e8a470dd179)), closes [#1514](https://github.com/stryker-mutator/stryker/issues/1514) [#1980](https://github.com/stryker-mutator/stryker/issues/1980)
- **core:** add support for checker plugins ([#2285](https://github.com/stryker-mutator/stryker/issues/2285)) ([69358e1](https://github.com/stryker-mutator/stryker/commit/69358e1423701c730e29d303119a08d74081f340))
- **jasmine-runner:** implement new test runner api ([#2256](https://github.com/stryker-mutator/stryker/issues/2256)) ([871db8c](https://github.com/stryker-mutator/stryker/commit/871db8c24c3389133d9b4476acd33b0ddd956a36)), closes [#2249](https://github.com/stryker-mutator/stryker/issues/2249)

### BREAKING CHANGES

- **core:** \* `--maxConcurrentTestRunners` is now deprecated. Please use `--concurrency` instead.

## [3.3.1](https://github.com/stryker-mutator/stryker/compare/v3.3.0...v3.3.1) (2020-07-04)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [3.3.0](https://github.com/stryker-mutator/stryker/compare/v3.2.4...v3.3.0) (2020-06-16)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [3.2.4](https://github.com/stryker-mutator/stryker/compare/v3.2.3...v3.2.4) (2020-05-18)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [3.2.3](https://github.com/stryker-mutator/stryker/compare/v3.2.2...v3.2.3) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [3.2.2](https://github.com/stryker-mutator/stryker/compare/v3.2.1...v3.2.2) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [3.2.1](https://github.com/stryker-mutator/stryker/compare/v3.2.0...v3.2.1) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [3.2.0](https://github.com/stryker-mutator/stryker/compare/v3.1.0...v3.2.0) (2020-05-13)

### Features

- **validation:** validate StrykerOptions using JSON schema ([5f05665](https://github.com/stryker-mutator/stryker/commit/5f0566581abdd1229dfe5d27a25a676bec93d8f8))
- **validation:** add validation on plugin options ([#2158](https://github.com/stryker-mutator/stryker/issues/2158)) ([d78fe1e](https://github.com/stryker-mutator/stryker/commit/d78fe1e013ac2e309a29f0def3029492b1e6c1ea))
- **validation:** warn about unknown stryker config options ([#2164](https://github.com/stryker-mutator/stryker/issues/2164)) ([8c6fd97](https://github.com/stryker-mutator/stryker/commit/8c6fd972dc57e246d361132dc176920d380c91cc)), closes [#2103](https://github.com/stryker-mutator/stryker/issues/2103)

# [3.1.0](https://github.com/stryker-mutator/stryker/compare/v3.0.2...v3.1.0) (2020-03-29)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [3.0.2](https://github.com/stryker-mutator/stryker/compare/v3.0.1...v3.0.2) (2020-03-13)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [3.0.1](https://github.com/stryker-mutator/stryker/compare/v3.0.0...v3.0.1) (2020-03-12)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [3.0.0](https://github.com/stryker-mutator/stryker/compare/v2.5.0...v3.0.0) (2020-03-11)

### Bug Fixes

- **mocha:** support mutants with "runAllTests" ([#2037](https://github.com/stryker-mutator/stryker/issues/2037)) ([a9da18a](https://github.com/stryker-mutator/stryker/commit/a9da18aa67845db943c5ce8ebd69b368b34e134e)), closes [#2032](https://github.com/stryker-mutator/stryker/issues/2032)

### Features

- **Reporter.onScoreCalculated:** remove deprecated onScoreCalculatedevent ([#2026](https://github.com/stryker-mutator/stryker/issues/2026)) ([9fa4175](https://github.com/stryker-mutator/stryker/commit/9fa41757d7bed58c98bc3fbd0c8c861670fbd025))

### BREAKING CHANGES

- **Reporter.onScoreCalculated:** Please use the `onMutationTestReportReady` event and the `mutation-testing-metrics` npm package to calculate the mutation testing report metrics.

This

```ts
class MyReporter {
  onScoreCalculated(scoreResult) {
    // => do stuff with score result
  }
}
```

Becomes this:

```ts
import { calculateMetrics } from 'mutation-testing-metrics';
class MyReporter {
  onMutationTestingReportReady(report) {
    const reportMetrics = calculateMetrics(report.files);
    // => do stuff with report metrics
  }
}
```

# [2.5.0](https://github.com/stryker-mutator/stryker/compare/v2.4.0...v2.5.0) (2020-01-12)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [2.4.0](https://github.com/stryker-mutator/stryker/compare/v2.3.0...v2.4.0) (2019-11-24)

### Features

- **report:** support upload of full report to dashboard ([#1783](https://github.com/stryker-mutator/stryker/issues/1783)) ([fbb8102](https://github.com/stryker-mutator/stryker/commit/fbb8102))

# [2.3.0](https://github.com/stryker-mutator/stryker/compare/v2.2.1...v2.3.0) (2019-11-13)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [2.2.1](https://github.com/stryker-mutator/stryker/compare/v2.2.0...v2.2.1) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [2.2.0](https://github.com/stryker-mutator/stryker/compare/v2.1.0...v2.2.0) (2019-11-06)

### Features

- **javascript-mutator:** allow to override babel plugins ([#1764](https://github.com/stryker-mutator/stryker/issues/1764)) ([ddb3d60](https://github.com/stryker-mutator/stryker/commit/ddb3d60))
- **mutant-matcher:** lower memory usage ([#1794](https://github.com/stryker-mutator/stryker/issues/1794)) ([16294e5](https://github.com/stryker-mutator/stryker/commit/16294e5))

# [2.1.0](https://github.com/stryker-mutator/stryker/compare/v2.0.2...v2.1.0) (2019-09-08)

### Features

- **mocha:** support mocha 6.2 ([feddcf1](https://github.com/stryker-mutator/stryker/commit/feddcf1))

## [2.0.2](https://github.com/stryker-mutator/stryker/compare/v2.0.1...v2.0.2) (2019-07-11)

### Bug Fixes

- **dispose:** fix race condition in dispose action ([124ef6a](https://github.com/stryker-mutator/stryker/commit/124ef6a)), closes [#1542](https://github.com/stryker-mutator/stryker/issues/1542)

## [2.0.1](https://github.com/stryker-mutator/stryker/compare/v2.0.0...v2.0.1) (2019-07-02)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)

### Features

- **reporter:** implement `mutationTestReport` ([16ba76b](https://github.com/stryker-mutator/stryker/commit/16ba76b))

## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)

**Note:** Version bump only for package @stryker-mutator/test-helpers

# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [1.0.1](https://github.com/stryker-mutator/stryker/compare/v1.0.0...v1.0.1) (2019-02-13)

**Note:** Version bump only for package @stryker-mutator/test-helpers

## [1.0.0](https://github.com/stryker-mutator/stryker/compare/@stryker-mutator/test-helpers@0.1.1...@stryker-mutator/test-helpers@1.0.0) (2019-02-13)

### Features

- **init:** Make stryker init work with new naming scheme ([fefd0ae](https://github.com/stryker-mutator/stryker/commit/fefd0ae))
- **rename:** rename `stryker-xxx-xxx` -> `[@stryker-mutator](https://github.com/stryker-mutator)/xxx-xxx` ([1bbd6ff](https://github.com/stryker-mutator/stryker/commit/1bbd6ff))

### BREAKING CHANGES

- **rename:** The core package and plugins have been renamed: stryker-test-helpers -> @stryker-mutator/test-helpers

## [0.1.1](https://github.com/stryker-mutator/stryker/compare/@stryker-mutator/test-helpers@0.1.0...@stryker-mutator/test-helpers@0.1.1) (2019-02-12)

### Bug Fixes

- **mutants:** Prevent memory leak when transpiling mutants ([#1376](https://github.com/stryker-mutator/stryker/issues/1376)) ([45c2852](https://github.com/stryker-mutator/stryker/commit/45c2852)), closes [#920](https://github.com/stryker-mutator/stryker/issues/920)

# 0.1.0 (2019-02-08)

### Features

- **config-editors:** Remove side effects from all config editor plugins ([#1317](https://github.com/stryker-mutator/stryker/issues/1317)) ([1f61bed](https://github.com/stryker-mutator/stryker/commit/1f61bed))
- **dependency injection:** Add dependency injection for plugins ([#1313](https://github.com/stryker-mutator/stryker/issues/1313)) ([f90cd56](https://github.com/stryker-mutator/stryker/commit/f90cd56)), closes [#667](https://github.com/stryker-mutator/stryker/issues/667)
- **test-runner:** Use new plugin system to load TestRunner plugins ([#1361](https://github.com/stryker-mutator/stryker/issues/1361)) ([266247b](https://github.com/stryker-mutator/stryker/commit/266247b))
- **transpilers:** Remove side effects transpiler plugins ([#1351](https://github.com/stryker-mutator/stryker/issues/1351)) ([9a8b539](https://github.com/stryker-mutator/stryker/commit/9a8b539))
