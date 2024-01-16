# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [8.0.0](https://github.com/stryker-mutator/stryker-js/compare/v7.3.0...v8.0.0) (2023-11-30)

### Features

- **node:** drop official support for node 16 ([#4542](https://github.com/stryker-mutator/stryker-js/issues/4542)) ([e190207](https://github.com/stryker-mutator/stryker-js/commit/e190207e25926179c1a3ed2c0ff97a13720c57bd))

### BREAKING CHANGES

- **node:** NodeJS 16 is no longer supported. Please use NodeJS 18 or higher. See https://nodejs.org/en/about/previous-releases

# [7.3.0](https://github.com/stryker-mutator/stryker-js/compare/v7.2.0...v7.3.0) (2023-10-15)

### Bug Fixes

- **package:** don't publish test and tsbuildinfo. ([#4464](https://github.com/stryker-mutator/stryker-js/issues/4464)) ([ae3d2d8](https://github.com/stryker-mutator/stryker-js/commit/ae3d2d8f6bd92be73dface5cc7e08589872a4d60))

# [7.2.0](https://github.com/stryker-mutator/stryker-js/compare/v7.1.1...v7.2.0) (2023-10-02)

### Bug Fixes

- **npm package:** ignore unused files ([#4405](https://github.com/stryker-mutator/stryker-js/issues/4405)) ([f14e789](https://github.com/stryker-mutator/stryker-js/commit/f14e78944652ceccd205ca1541465292e758c565))

## [7.1.1](https://github.com/stryker-mutator/stryker-js/compare/v7.1.0...v7.1.1) (2023-07-15)

### Bug Fixes

- **deps:** update dependency tslib to v2.6.0 ([#4335](https://github.com/stryker-mutator/stryker-js/issues/4335)) ([e4c00ef](https://github.com/stryker-mutator/stryker-js/commit/e4c00ef9cddcc72b1bf0df5f10893933caaed7ef))

# [7.1.0](https://github.com/stryker-mutator/stryker-js/compare/v7.0.2...v7.1.0) (2023-06-24)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [7.0.2](https://github.com/stryker-mutator/stryker-js/compare/v7.0.1...v7.0.2) (2023-06-08)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [7.0.1](https://github.com/stryker-mutator/stryker-js/compare/v7.0.0...v7.0.1) (2023-06-03)

### Bug Fixes

- **deps:** update `@stryker-mutator/core` peer dep ([9dd4a76](https://github.com/stryker-mutator/stryker-js/commit/9dd4a767d30830861a3e997266a6491fae799acd))

# [7.0.0](https://github.com/stryker-mutator/stryker-js/compare/v6.4.2...v7.0.0) (2023-06-02)

### chore

- **esm:** use "exports" and module "Node16" ([#4171](https://github.com/stryker-mutator/stryker-js/issues/4171)) ([cdf4a34](https://github.com/stryker-mutator/stryker-js/commit/cdf4a342b73d922423eb46a919eb3b38c4c43c46))

### Features

- **node:** Drop support for node 14 ([#4105](https://github.com/stryker-mutator/stryker-js/issues/4105)) ([a88744f](https://github.com/stryker-mutator/stryker-js/commit/a88744f1a5fa47274ee0f30abc635831b18113fa))

### BREAKING CHANGES

- **esm:** Deep (and undocumented) imports from `@stryker-mutator/core` or one of the plugins will no longer work. If you want to import something that's not available, please let us know by [opening an issue](https://github.com/stryker-mutator/stryker-js/issues/new/choose)
- **node:** Node 14 is no longer supported. Please install an LTS version of node: nodejs.org/

## [6.4.2](https://github.com/stryker-mutator/stryker-js/compare/v6.4.1...v6.4.2) (2023-03-24)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [6.4.1](https://github.com/stryker-mutator/stryker-js/compare/v6.4.0...v6.4.1) (2023-02-17)

### Bug Fixes

- **deps:** set correct stryker peer dep version ([c88c537](https://github.com/stryker-mutator/stryker-js/commit/c88c537c61d03e50362e98e9dddc7569b0c88200))

# [6.4.0](https://github.com/stryker-mutator/stryker-js/compare/v6.3.1...v6.4.0) (2023-02-17)

### Bug Fixes

- **deps:** update dependency glob to ~8.1.0 ([#3945](https://github.com/stryker-mutator/stryker-js/issues/3945)) ([edb767a](https://github.com/stryker-mutator/stryker-js/commit/edb767a20df6e3acf203492106caf642749e37bb))
- **deps:** update dependency tslib to ~2.5.0 ([#3952](https://github.com/stryker-mutator/stryker-js/issues/3952)) ([7548287](https://github.com/stryker-mutator/stryker-js/commit/7548287ee000bc09f88e6f1f0848e6e8e625bbb5))

## [6.3.1](https://github.com/stryker-mutator/stryker-js/compare/v6.3.0...v6.3.1) (2022-12-18)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [6.3.0](https://github.com/stryker-mutator/stryker-js/compare/v6.2.3...v6.3.0) (2022-10-30)

### Features

- **ci:** forbid `.only` in CI pipeline tests ([#3823](https://github.com/stryker-mutator/stryker-js/issues/3823)) ([051ec93](https://github.com/stryker-mutator/stryker-js/commit/051ec937809468751a74c9e01cacd27ceb1acca2))

## [6.2.3](https://github.com/stryker-mutator/stryker-js/compare/v6.2.2...v6.2.3) (2022-10-10)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [6.2.2](https://github.com/stryker-mutator/stryker-js/compare/v6.2.1...v6.2.2) (2022-09-06)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [6.2.1](https://github.com/stryker-mutator/stryker-js/compare/v6.2.0...v6.2.1) (2022-09-06)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [6.2.0](https://github.com/stryker-mutator/stryker-js/compare/v6.1.2...v6.2.0) (2022-09-06)

### Features

- **incremental:** add incremental mode ([#3609](https://github.com/stryker-mutator/stryker-js/issues/3609)) ([82bea56](https://github.com/stryker-mutator/stryker-js/commit/82bea5604c81c1ccf76d44827ad3922cfb61463b))

# [6.2.0-beta.0](https://github.com/stryker-mutator/stryker-js/compare/v6.1.2...v6.2.0-beta.0) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [6.1.2](https://github.com/stryker-mutator/stryker-js/compare/v6.1.1...v6.1.2) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [6.1.1](https://github.com/stryker-mutator/stryker-js/compare/v6.1.0...v6.1.1) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [6.1.0](https://github.com/stryker-mutator/stryker-js/compare/v6.0.2...v6.1.0) (2022-06-27)

### Features

- **mocha-runner:** report the test's file name ([#3504](https://github.com/stryker-mutator/stryker-js/issues/3504)) ([34d8e70](https://github.com/stryker-mutator/stryker-js/commit/34d8e70ff913303ea94080a5431d7c55bdf99987))

## [6.0.2](https://github.com/stryker-mutator/stryker-js/compare/v6.0.1...v6.0.2) (2022-05-05)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [6.0.1](https://github.com/stryker-mutator/stryker-js/compare/v6.0.0...v6.0.1) (2022-05-04)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [6.0.0](https://github.com/stryker-mutator/stryker-js/compare/v6.0.0-beta.0...v6.0.0) (2022-05-03)

### chore

- **node:** drop support for Node 12 ([10d874e](https://github.com/stryker-mutator/stryker-js/commit/10d874e4c46335d9ea457634d3061af35fa8f854))

### Features

- **mocha-runner:** widen mocha peer dependency to include v10 ([#3492](https://github.com/stryker-mutator/stryker-js/issues/3492)) ([0dde30f](https://github.com/stryker-mutator/stryker-js/commit/0dde30f95c3cde3de7df6babfde71593534b8569))

### BREAKING CHANGES

- **node:** Drop support for Node 12. Minimal version is now Node 14.18.0.

# [6.0.0-beta.0](https://github.com/stryker-mutator/stryker-js/compare/v5.6.1...v6.0.0-beta.0) (2022-03-02)

### Features

- **esm config:** support config file as pure esm ([#3432](https://github.com/stryker-mutator/stryker-js/issues/3432)) ([309a7e2](https://github.com/stryker-mutator/stryker-js/commit/309a7e2807e454a82f177de781bc4908f87c739b))
- **esm:** migrate StrykerJS to pure ESM ([#3409](https://github.com/stryker-mutator/stryker-js/issues/3409)) ([78c305e](https://github.com/stryker-mutator/stryker-js/commit/78c305e2c2271fedb54bfff3d34aa6b70b421b3a))
- **esm:** support esm in the mocha runner ([#3393](https://github.com/stryker-mutator/stryker-js/issues/3393)) ([2eb3504](https://github.com/stryker-mutator/stryker-js/commit/2eb35042da4e78021dcf54ac71c22f97eb91ff70)), closes [#2413](https://github.com/stryker-mutator/stryker-js/issues/2413) [#2413](https://github.com/stryker-mutator/stryker-js/issues/2413)
- **ignore static:** prevent leak of hybrid mutants ([#3443](https://github.com/stryker-mutator/stryker-js/issues/3443)) ([231049a](https://github.com/stryker-mutator/stryker-js/commit/231049a32f73083c7579b1bf8b4424ad309f655d))
- **reload test environment:** implement test environment reload ([#3369](https://github.com/stryker-mutator/stryker-js/issues/3369)) ([b95b907](https://github.com/stryker-mutator/stryker-js/commit/b95b907e54d3a114731a8bcf659a1910df4e4f0b))
- **test runner api:** `killedBy` is always an array ([#3187](https://github.com/stryker-mutator/stryker-js/issues/3187)) ([c257966](https://github.com/stryker-mutator/stryker-js/commit/c257966e6c7726e180e072c8ae7f3fd011485c05))

### BREAKING CHANGES

- **esm config:** Exporting a function (using `module.exports = function(config) {}`) from your `stryker.conf.js` file is no longer supported. This was already deprecated but now will give an error.
- **esm:** StrykerJS is now a pure ESM. Please [read this](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
- **esm:** Node 12.20 is now the min version.
- **esm:** Karma v6.3 is now the min supported karma version for `@stryker-mutator/karma-runner`, since [that version added support for async config loading](https://github.com/karma-runner/karma/blob/master/CHANGELOG.md#630-2021-03-23)
- **esm:** The `@stryker-mutator/mocha-runner` now requires `mocha@7.2` or higher.
- **reload test environment:** Test runner plugins must provide `TestRunnerCapabilities` by implementing the `capabilities` method.

## [5.6.1](https://github.com/stryker-mutator/stryker-js/compare/v5.6.0...v5.6.1) (2022-01-23)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [5.6.0](https://github.com/stryker-mutator/stryker-js/compare/v5.5.1...v5.6.0) (2022-01-09)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [5.5.1](https://github.com/stryker-mutator/stryker-js/compare/v5.5.0...v5.5.1) (2021-12-02)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [5.5.0](https://github.com/stryker-mutator/stryker-js/compare/v5.4.1...v5.5.0) (2021-11-23)

### Features

- **hit limit:** infinite loop prevention in mocha-runner ([f5a7d1d](https://github.com/stryker-mutator/stryker-js/commit/f5a7d1d18ec45364743e5aceb71f0f1bbbf3bafa))

## [5.4.1](https://github.com/stryker-mutator/stryker-js/compare/v5.4.0...v5.4.1) (2021-09-30)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [5.4.0](https://github.com/stryker-mutator/stryker-js/compare/v5.3.0...v5.4.0) (2021-09-01)

### Features

- **test runner:** Support for disable bail ([#3074](https://github.com/stryker-mutator/stryker-js/issues/3074)) ([0962232](https://github.com/stryker-mutator/stryker-js/commit/0962232fe2a181a2fde0067ed95f99885b8cee28))

# [5.3.0](https://github.com/stryker-mutator/stryker-js/compare/v5.2.3...v5.3.0) (2021-08-07)

### Features

- **hit limit:** infinite loop prevention in karma-runner ([#3031](https://github.com/stryker-mutator/stryker-js/issues/3031)) ([fc732fc](https://github.com/stryker-mutator/stryker-js/commit/fc732fce8838c96be2fdf37aff69b12c996d7cb0))

## [5.2.3](https://github.com/stryker-mutator/stryker-js/compare/v5.2.2...v5.2.3) (2021-08-01)

### Bug Fixes

- **mocha-runner:** clear error when require esm ([#3015](https://github.com/stryker-mutator/stryker-js/issues/3015)) ([a835f0b](https://github.com/stryker-mutator/stryker-js/commit/a835f0b57a9084b77a175b5eb14f409651c20c69)), closes [#3014](https://github.com/stryker-mutator/stryker-js/issues/3014)

## [5.2.2](https://github.com/stryker-mutator/stryker-js/compare/v5.2.1...v5.2.2) (2021-07-13)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [5.2.1](https://github.com/stryker-mutator/stryker-js/compare/v5.2.0...v5.2.1) (2021-07-02)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [5.2.0](https://github.com/stryker-mutator/stryker-js/compare/v5.1.1...v5.2.0) (2021-07-02)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [5.1.1](https://github.com/stryker-mutator/stryker-js/compare/v5.1.0...v5.1.1) (2021-06-15)

### Bug Fixes

- **peerDeps:** update peer dependencies ([05733d2](https://github.com/stryker-mutator/stryker-js/commit/05733d260d5ffc9eb1b3e284bdc4bc8adafc4d38))

# [5.1.0](https://github.com/stryker-mutator/stryker-js/compare/v5.0.1...v5.1.0) (2021-06-14)

### Features

- **mocha-runner:** officially support mocha 9 ([42848bb](https://github.com/stryker-mutator/stryker-js/commit/42848bba288adcefb8d8f8fac1cd34b17bd1d49f))

## [5.0.1](https://github.com/stryker-mutator/stryker-js/compare/v5.0.0...v5.0.1) (2021-05-28)

### Bug Fixes

- **mocha-runner:** improve debug logging ([#2925](https://github.com/stryker-mutator/stryker-js/issues/2925)) ([ecc53ee](https://github.com/stryker-mutator/stryker-js/commit/ecc53ee3314f9e4b71aa370f35d87d699471fc55))

# [5.0.0](https://github.com/stryker-mutator/stryker-js/compare/v4.6.0...v5.0.0) (2021-05-14)

### Features

- **node:** Drop support for node 10 ([#2879](https://github.com/stryker-mutator/stryker-js/issues/2879)) ([dd29f88](https://github.com/stryker-mutator/stryker-js/commit/dd29f883d384fd29b86a0ef9f78808975657a001))
- **reporter api:** unify reporter api with mutation-testing-elements ([#2798](https://github.com/stryker-mutator/stryker-js/issues/2798)) ([d173b27](https://github.com/stryker-mutator/stryker-js/commit/d173b27117ade43e86a991643207532e338e7907)), closes [#2766](https://github.com/stryker-mutator/stryker-js/issues/2766)

### BREAKING CHANGES

- **node:** Node 10 is no longer supported. Please use Node 12 or higher.
- **reporter api:** Changes to `Reporter` and `TestRunner` plugin API of Stryker

# [4.6.0](https://github.com/stryker-mutator/stryker-js/compare/v4.5.1...v4.6.0) (2021-04-16)

### Features

- **rename:** rename to StrykerJS ([#2813](https://github.com/stryker-mutator/stryker-js/issues/2813)) ([dc08592](https://github.com/stryker-mutator/stryker-js/commit/dc08592c09c0fe5fcc21db03dc2da4e03713f46b)), closes [#2754](https://github.com/stryker-mutator/stryker-js/issues/2754)

## [4.5.1](https://github.com/stryker-mutator/stryker/compare/v4.5.0...v4.5.1) (2021-03-11)

### Bug Fixes

- **peer-deps:** use correct peer dep version ([a6ca0f2](https://github.com/stryker-mutator/stryker/commit/a6ca0f25b29cb84a2cb4b8c05a42e7305d5dde16))

# [4.5.0](https://github.com/stryker-mutator/stryker/compare/v4.4.1...v4.5.0) (2021-03-06)

### Bug Fixes

- **reporting:** report test name when a hook fails ([#2757](https://github.com/stryker-mutator/stryker/issues/2757)) ([5e062b2](https://github.com/stryker-mutator/stryker/commit/5e062b2b65a1269b45a66ecc536108aab529abae))

### Features

- **package:** restructure package internals ([#2714](https://github.com/stryker-mutator/stryker/issues/2714)) ([e1711d2](https://github.com/stryker-mutator/stryker/commit/e1711d28f25e8ee7cbdf025adecb3234ee0515a6))

## [4.4.1](https://github.com/stryker-mutator/stryker/compare/v4.4.0...v4.4.1) (2021-01-27)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [4.4.0](https://github.com/stryker-mutator/stryker/compare/v4.3.1...v4.4.0) (2021-01-24)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [4.3.1](https://github.com/stryker-mutator/stryker/compare/v4.3.0...v4.3.1) (2020-12-25)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [4.3.0](https://github.com/stryker-mutator/stryker/compare/v4.2.0...v4.3.0) (2020-12-25)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [4.2.0](https://github.com/stryker-mutator/stryker/compare/v4.1.2...v4.2.0) (2020-12-09)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [4.1.2](https://github.com/stryker-mutator/stryker/compare/v4.1.1...v4.1.2) (2020-11-06)

### Bug Fixes

- **peerDeps:** update core in peerDependencies ([045dbc3](https://github.com/stryker-mutator/stryker/commit/045dbc3742c123658f4cf9ab2786b20ffd89a8cf))

## [4.1.1](https://github.com/stryker-mutator/stryker/compare/v4.1.0...v4.1.1) (2020-11-05)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [4.1.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0...v4.1.0) (2020-10-30)

### Features

- **mocha:** support mocha 8.2 ([#2591](https://github.com/stryker-mutator/stryker/issues/2591)) ([b633629](https://github.com/stryker-mutator/stryker/commit/b63362983477815cde15e20e8453079128b9e609))

# [4.0.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.10...v4.0.0) (2020-10-07)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [4.0.0-beta.10](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.9...v4.0.0-beta.10) (2020-10-05)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [4.0.0-beta.9](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.8...v4.0.0-beta.9) (2020-09-30)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [4.0.0-beta.8](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.7...v4.0.0-beta.8) (2020-09-22)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [4.0.0-beta.7](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2020-09-17)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [4.0.0-beta.6](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2020-09-10)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [4.0.0-beta.5](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2020-09-09)

### Bug Fixes

- **mocha-runner:** don't allow custom timeout ([#2463](https://github.com/stryker-mutator/stryker/issues/2463)) ([e90b563](https://github.com/stryker-mutator/stryker/commit/e90b5635907dfcd36de98d73fa6c2da31f69fbed))
- **mocha-runner:** fix memory leaks ([23eede2](https://github.com/stryker-mutator/stryker/commit/23eede22036c9efa502af8016e530af780a7cebb))

### Features

- **typescript:** Disable type checking ([#2446](https://github.com/stryker-mutator/stryker/issues/2446)) ([3ff996b](https://github.com/stryker-mutator/stryker/commit/3ff996b7516b7782434d86aa9aecbee334978a7f)), closes [#2438](https://github.com/stryker-mutator/stryker/issues/2438)

# [4.0.0-beta.4](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2020-08-29)

### Features

- **api:** rename test_runner2 -> test_runner ([#2442](https://github.com/stryker-mutator/stryker/issues/2442)) ([4d3ae97](https://github.com/stryker-mutator/stryker/commit/4d3ae9764dbd689c895b76e44f2eea76c82fabc8))
- **test-runner:** add `nrOfTests` metric ([0eea448](https://github.com/stryker-mutator/stryker/commit/0eea44892e2383e8b0a34c6267e2f455d604f55a))

### BREAKING CHANGES

- **api:** Plugin creators should now use `'test_runner'` instead of `'test_runner2'`.

# [4.0.0-beta.3](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2020-08-19)

### Features

- **mocha:** deprecate mocha < v6 ([#2379](https://github.com/stryker-mutator/stryker/issues/2379)) ([fee0754](https://github.com/stryker-mutator/stryker/commit/fee0754c395ade4ee92d434963034e59ea5d180d))
- **test runner api:** remove `sandboxFileNames` injectable values ([#2369](https://github.com/stryker-mutator/stryker/issues/2369)) ([92f3bf5](https://github.com/stryker-mutator/stryker/commit/92f3bf528d0b01be1f6c219b37a5f90da0431686)), closes [#2351](https://github.com/stryker-mutator/stryker/issues/2351)

### BREAKING CHANGES

- **mocha:** Mocha@<6 is deprecated and support for it will be removed in Stryker v5

# [4.0.0-beta.2](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2020-08-07)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [4.0.0-beta.1](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2020-07-17)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [4.0.0-beta.0](https://github.com/stryker-mutator/stryker/compare/v3.3.1...v4.0.0-beta.0) (2020-07-10)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [3.3.1](https://github.com/stryker-mutator/stryker/compare/v3.3.0...v3.3.1) (2020-07-04)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [3.3.0](https://github.com/stryker-mutator/stryker/compare/v3.2.4...v3.3.0) (2020-06-16)

### Features

- **mocha-runner:** support mocha 8 ([#2259](https://github.com/stryker-mutator/stryker/issues/2259)) ([917d965](https://github.com/stryker-mutator/stryker/commit/917d965e72871a2199dd9b2d710d40b350509431))

## [3.2.4](https://github.com/stryker-mutator/stryker/compare/v3.2.3...v3.2.4) (2020-05-18)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [3.2.3](https://github.com/stryker-mutator/stryker/compare/v3.2.2...v3.2.3) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [3.2.2](https://github.com/stryker-mutator/stryker/compare/v3.2.1...v3.2.2) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [3.2.1](https://github.com/stryker-mutator/stryker/compare/v3.2.0...v3.2.1) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [3.2.0](https://github.com/stryker-mutator/stryker/compare/v3.1.0...v3.2.0) (2020-05-13)

### Features

- **api:** Deprecated Config in favor of StrykerOptions ([dccdd91](https://github.com/stryker-mutator/stryker/commit/dccdd9119743d776e2dc4b572a9e02b1524ef88b))
- **validation:** add validation on plugin options ([#2158](https://github.com/stryker-mutator/stryker/issues/2158)) ([d78fe1e](https://github.com/stryker-mutator/stryker/commit/d78fe1e013ac2e309a29f0def3029492b1e6c1ea))

# [3.1.0](https://github.com/stryker-mutator/stryker/compare/v3.0.2...v3.1.0) (2020-03-29)

### Features

- **mocha:** support mocha 7 ([#2114](https://github.com/stryker-mutator/stryker/issues/2114)) ([4a4d677](https://github.com/stryker-mutator/stryker/commit/4a4d677d8dd291cd063ed6b887d4d702f31e84d1)), closes [#2108](https://github.com/stryker-mutator/stryker/issues/2108)

## [3.0.2](https://github.com/stryker-mutator/stryker/compare/v3.0.1...v3.0.2) (2020-03-13)

### Bug Fixes

- **nodejs requirement:** set NodeJS requirement to at least Node 10 ([8c08059](https://github.com/stryker-mutator/stryker/commit/8c080594a87d638ea4349ee69e05ed6c7eba6463))
- **nodejs requirement:** set NodeJS requirement to at least Node 10 ([#2101](https://github.com/stryker-mutator/stryker/issues/2101)) ([3a1f067](https://github.com/stryker-mutator/stryker/commit/3a1f067664b933de9524456260c1a28fccb20b6b))

## [3.0.1](https://github.com/stryker-mutator/stryker/compare/v3.0.0...v3.0.1) (2020-03-12)

### Bug Fixes

- **Peer dependencies:** set peer dependencies for v3 ([#2096](https://github.com/stryker-mutator/stryker/issues/2096)) ([8648c4d](https://github.com/stryker-mutator/stryker/commit/8648c4d9c70ce032841371c6041ebb76bf099948)), closes [#2095](https://github.com/stryker-mutator/stryker/issues/2095)

# [3.0.0](https://github.com/stryker-mutator/stryker/compare/v2.5.0...v3.0.0) (2020-03-11)

### Bug Fixes

- **mocha:** support mutants with "runAllTests" ([#2037](https://github.com/stryker-mutator/stryker/issues/2037)) ([a9da18a](https://github.com/stryker-mutator/stryker/commit/a9da18aa67845db943c5ce8ebd69b368b34e134e)), closes [#2032](https://github.com/stryker-mutator/stryker/issues/2032)

### Features

- **config:** Allow a `stryker.conf.json` as default config file. ([#2092](https://github.com/stryker-mutator/stryker/issues/2092)) ([2279813](https://github.com/stryker-mutator/stryker/commit/2279813dec4f9fabbfe9dcd521dc2e19d5902dc6))
- **Initializer:** Initialize config file as JSON by default ([#2093](https://github.com/stryker-mutator/stryker/issues/2093)) ([e07d953](https://github.com/stryker-mutator/stryker/commit/e07d9535084881180d5abf7b58bece1b65f2455f)), closes [#2000](https://github.com/stryker-mutator/stryker/issues/2000)

# [2.5.0](https://github.com/stryker-mutator/stryker/compare/v2.4.0...v2.5.0) (2020-01-12)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [2.4.0](https://github.com/stryker-mutator/stryker/compare/v2.3.0...v2.4.0) (2019-11-24)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [2.3.0](https://github.com/stryker-mutator/stryker/compare/v2.2.1...v2.3.0) (2019-11-13)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [2.2.1](https://github.com/stryker-mutator/stryker/compare/v2.2.0...v2.2.1) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [2.2.0](https://github.com/stryker-mutator/stryker/compare/v2.1.0...v2.2.0) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [2.1.0](https://github.com/stryker-mutator/stryker/compare/v2.0.2...v2.1.0) (2019-09-08)

### Features

- **mocha:** support mocha 6.2 ([feddcf1](https://github.com/stryker-mutator/stryker/commit/feddcf1))

## [2.0.2](https://github.com/stryker-mutator/stryker/compare/v2.0.1...v2.0.2) (2019-07-11)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [2.0.1](https://github.com/stryker-mutator/stryker/compare/v2.0.0...v2.0.1) (2019-07-02)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)

### Features

- **mocha:** deprecate mocha version 5 and below ([#1529](https://github.com/stryker-mutator/stryker/issues/1529)) ([1c55350](https://github.com/stryker-mutator/stryker/commit/1c55350))
- **node 6:** drop support for node 6 ([#1517](https://github.com/stryker-mutator/stryker/issues/1517)) ([801d7cd](https://github.com/stryker-mutator/stryker/commit/801d7cd))

### BREAKING CHANGES

- **node 6:** support for Node 6 has been dropped. Node 8 or higher is now required.
- **mocha:** the use of mocha version 5 and below is deprecated. Please upgrade to mocha 6 or above. See [their changelog](https://github.com/mochajs/mocha/blob/master/CHANGELOG.md#600--2019-02-18) for more information about upgrading.

## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)

### Features

- **mocha 6:** support all config formats ([#1511](https://github.com/stryker-mutator/stryker/issues/1511)) ([baa374d](https://github.com/stryker-mutator/stryker/commit/baa374d))

# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [1.0.2](https://github.com/stryker-mutator/stryker/compare/v1.0.1...v1.0.2) (2019-02-13)

### Bug Fixes

- **stryker init:** update metadata for `stryker init` command ([#1403](https://github.com/stryker-mutator/stryker/issues/1403)) ([38f269b](https://github.com/stryker-mutator/stryker/commit/38f269b)), closes [#1402](https://github.com/stryker-mutator/stryker/issues/1402)

## [1.0.1](https://github.com/stryker-mutator/stryker/compare/v1.0.0...v1.0.1) (2019-02-13)

**Note:** Version bump only for package @stryker-mutator/mocha-runner

## [1.0.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.17.1...@stryker-mutator/mocha-runner@1.0.0) (2019-02-13)

### Features

- **factories:** remove deprecated factories ([#1381](https://github.com/stryker-mutator/stryker/issues/1381)) ([df2fcdf](https://github.com/stryker-mutator/stryker/commit/df2fcdf))
- **rename:** rename `stryker-xxx-xxx` -> `[@stryker-mutator](https://github.com/stryker-mutator)/xxx-xxx` ([1bbd6ff](https://github.com/stryker-mutator/stryker/commit/1bbd6ff))

### BREAKING CHANGES

- **rename:** The core package and plugins have been renamed: stryker-mocha-runner -> @stryker-mutator/mocha-runner
- **factories:** Remove the Factory (and children) from the stryker-api package. Use DI to ensure classes are created. For more information, see https://github.com/stryker-mutator/stryker-handbook/blob/master/stryker/api/plugins.md#dependency-injection

## [0.17.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.17.0...stryker-mocha-runner@0.17.1) (2019-02-12)

**Note:** Version bump only for package stryker-mocha-runner

# [0.17.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.16.0...stryker-mocha-runner@0.17.0) (2019-02-08)

### Features

- **config-editors:** Remove side effects from all config editor plugins ([#1317](https://github.com/stryker-mutator/stryker/issues/1317)) ([1f61bed](https://github.com/stryker-mutator/stryker/commit/1f61bed))
- **dependency injection:** Add dependency injection for plugins ([#1313](https://github.com/stryker-mutator/stryker/issues/1313)) ([f90cd56](https://github.com/stryker-mutator/stryker/commit/f90cd56)), closes [#667](https://github.com/stryker-mutator/stryker/issues/667)
- **mocha-runner:** Allow empty mochaOptions.opts file (with `false`) ([d9bba6e](https://github.com/stryker-mutator/stryker/commit/d9bba6e))
- **port:** Deprecate property 'port' ([#1309](https://github.com/stryker-mutator/stryker/issues/1309)) ([2539ee0](https://github.com/stryker-mutator/stryker/commit/2539ee0))
- **test-frameworks:** Remove side effects from all test-framework plugins ([#1319](https://github.com/stryker-mutator/stryker/issues/1319)) ([a7160f4](https://github.com/stryker-mutator/stryker/commit/a7160f4))
- **test-runner:** Use new plugin system to load TestRunner plugins ([#1361](https://github.com/stryker-mutator/stryker/issues/1361)) ([266247b](https://github.com/stryker-mutator/stryker/commit/266247b))
- **transpilers:** Remove side effects transpiler plugins ([#1351](https://github.com/stryker-mutator/stryker/issues/1351)) ([9a8b539](https://github.com/stryker-mutator/stryker/commit/9a8b539))

<a name="0.16.0"></a>

# [0.16.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.15.3...stryker-mocha-runner@0.16.0) (2018-12-23)

### Features

- **mocha-runner:** Add support for `--grep` option ([#1277](https://github.com/stryker-mutator/stryker/issues/1277)) ([2b8ad7a](https://github.com/stryker-mutator/stryker/commit/2b8ad7a))
- **stryker-api:** Support stryker-api 0.23 ([#1293](https://github.com/stryker-mutator/stryker/issues/1293)) ([10720ad](https://github.com/stryker-mutator/stryker/commit/10720ad))

<a name="0.15.3"></a>

## [0.15.3](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.15.2...stryker-mocha-runner@0.15.3) (2018-12-12)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.15.2"></a>

## [0.15.2](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.15.1...stryker-mocha-runner@0.15.2) (2018-11-29)

### Bug Fixes

- **stryker-api:** Update stryker-api peer dependency version ([677fc28](https://github.com/stryker-mutator/stryker/commit/677fc28))

<a name="0.15.1"></a>

## [0.15.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.15.0...stryker-mocha-runner@0.15.1) (2018-11-29)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.15.0"></a>

# [0.15.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.14.6...stryker-mocha-runner@0.15.0) (2018-11-13)

### Features

- **mocha-runner:** use default mocha.opts file, support relative imports ([#1237](https://github.com/stryker-mutator/stryker/issues/1237)) ([2711c2b](https://github.com/stryker-mutator/stryker/commit/2711c2b)), closes [#1046](https://github.com/stryker-mutator/stryker/issues/1046)

<a name="0.14.6"></a>

## [0.14.6](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.14.5...stryker-mocha-runner@0.14.6) (2018-11-07)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.14.5"></a>

## [0.14.5](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.14.3...stryker-mocha-runner@0.14.5) (2018-10-15)

### Bug Fixes

- **version:** Version bump for failed release ([8cf9e87](https://github.com/stryker-mutator/stryker/commit/8cf9e87))

<a name="0.14.3"></a>

## [0.14.3](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.14.2...stryker-mocha-runner@0.14.3) (2018-10-03)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.14.2"></a>

## [0.14.2](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.14.1...stryker-mocha-runner@0.14.2) (2018-09-14)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.14.1"></a>

## [0.14.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.14.0...stryker-mocha-runner@0.14.1) (2018-08-21)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.14.0"></a>

# [0.14.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.13.3...stryker-mocha-runner@0.14.0) (2018-08-19)

### Features

- **stryker config:** rename config setting `reporter` to `reporters` ([#1088](https://github.com/stryker-mutator/stryker/issues/1088)) ([584218a](https://github.com/stryker-mutator/stryker/commit/584218a)), closes [#793](https://github.com/stryker-mutator/stryker/issues/793)

<a name="0.13.3"></a>

## [0.13.3](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.13.2...stryker-mocha-runner@0.13.3) (2018-08-17)

### Bug Fixes

- **dependencies:** support stryker-api 0.19.0 ([#1087](https://github.com/stryker-mutator/stryker/issues/1087)) ([44ce923](https://github.com/stryker-mutator/stryker/commit/44ce923))

<a name="0.13.2"></a>

## [0.13.2](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.13.1...stryker-mocha-runner@0.13.2) (2018-08-17)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.13.1"></a>

## [0.13.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.13.0...stryker-mocha-runner@0.13.1) (2018-08-03)

### Bug Fixes

- **mocha-runner:** Don't log individual successful tests ([#1042](https://github.com/stryker-mutator/stryker/issues/1042)) ([6732ccf](https://github.com/stryker-mutator/stryker/commit/6732ccf))

<a name="0.13.0"></a>

# [0.13.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.12.3...stryker-mocha-runner@0.13.0) (2018-07-20)

### Bug Fixes

- **Dependencies:** Pin all deps on minor version ([#974](https://github.com/stryker-mutator/stryker/issues/974)) ([f0a7e5a](https://github.com/stryker-mutator/stryker/commit/f0a7e5a)), closes [#954](https://github.com/stryker-mutator/stryker/issues/954) [#967](https://github.com/stryker-mutator/stryker/issues/967)

### Features

- **logging:** Allow log to a file ([#954](https://github.com/stryker-mutator/stryker/issues/954)) ([c2f6b82](https://github.com/stryker-mutator/stryker/commit/c2f6b82)), closes [#748](https://github.com/stryker-mutator/stryker/issues/748)

<a name="0.12.3"></a>

## [0.12.3](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.12.2...stryker-mocha-runner@0.12.3) (2018-07-04)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.12.2"></a>

## [0.12.2](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.12.1...stryker-mocha-runner@0.12.2) (2018-05-31)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.12.1"></a>

## [0.12.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.12.0...stryker-mocha-runner@0.12.1) (2018-05-21)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.12.0"></a>

# [0.12.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.11.2...stryker-mocha-runner@0.12.0) (2018-04-30)

### Features

- **node version:** drop node 4 support ([#724](https://github.com/stryker-mutator/stryker/issues/724)) ([a038931](https://github.com/stryker-mutator/stryker/commit/a038931))

### BREAKING CHANGES

- **node version:** Node 4 is no longer supported.

<a name="0.11.2"></a>

## [0.11.2](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.11.1...stryker-mocha-runner@0.11.2) (2018-04-20)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.11.1"></a>

## [0.11.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.11.0...stryker-mocha-runner@0.11.1) (2018-04-11)

### Bug Fixes

- Support stryker-api 0.16.0 ([#691](https://github.com/stryker-mutator/stryker/issues/691)) ([b2b019d](https://github.com/stryker-mutator/stryker/commit/b2b019d))

<a name="0.11.0"></a>

# [0.11.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.8...stryker-mocha-runner@0.11.0) (2018-04-04)

### Features

- **mocha-runner:** implement file discovery in mocha ([6ed7a0f](https://github.com/stryker-mutator/stryker/commit/6ed7a0f))

<a name="0.10.8"></a>

## [0.10.8](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.7...stryker-mocha-runner@0.10.8) (2018-03-22)

### Bug Fixes

- **peerDependency:** update stryker-api requirement to ^0.14.0 ([3ce04d4](https://github.com/stryker-mutator/stryker/commit/3ce04d4))

<a name="0.10.7"></a>

## [0.10.7](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.6...stryker-mocha-runner@0.10.7) (2018-03-22)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.10.6"></a>

## [0.10.6](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.5...stryker-mocha-runner@0.10.6) (2018-03-21)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.10.5"></a>

## [0.10.5](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.4...stryker-mocha-runner@0.10.5) (2018-02-07)

### Bug Fixes

- **dependencies:** update stryker-api requirement to ^0.13.0 ([8eba6d4](https://github.com/stryker-mutator/stryker/commit/8eba6d4))

<a name="0.10.4"></a>

## [0.10.4](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.3...stryker-mocha-runner@0.10.4) (2018-02-07)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.10.3"></a>

## [0.10.3](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.2...stryker-mocha-runner@0.10.3) (2018-01-19)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.10.2"></a>

## [0.10.2](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.1...stryker-mocha-runner@0.10.2) (2017-12-21)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.10.1"></a>

## [0.10.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.10.0...stryker-mocha-runner@0.10.1) (2017-11-27)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.10.0"></a>

# [0.10.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.9.1...stryker-mocha-runner@0.10.0) (2017-11-13)

### Features

- **mocha 4:** Add support for mocha version 4 ([#455](https://github.com/stryker-mutator/stryker/issues/455)) ([de6ae4f](https://github.com/stryker-mutator/stryker/commit/de6ae4f))

<a name="0.9.1"></a>

## [0.9.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.9.0...stryker-mocha-runner@0.9.1) (2017-10-24)

**Note:** Version bump only for package stryker-mocha-runner

<a name="0.9.0"></a>

# [0.9.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.8.1...stryker-mocha-runner@0.9.0) (2017-10-20)

### Bug Fixes

- **mocha framework:** Select tests based on name ([#413](https://github.com/stryker-mutator/stryker/issues/413)) ([bb7c02f](https://github.com/stryker-mutator/stryker/commit/bb7c02f)), closes [#249](https://github.com/stryker-mutator/stryker/issues/249)

### Features

- **mocha options:** Add support for mocha options ([#427](https://github.com/stryker-mutator/stryker/issues/427)) ([e0229c8](https://github.com/stryker-mutator/stryker/commit/e0229c8)), closes [#417](https://github.com/stryker-mutator/stryker/issues/417)

### BREAKING CHANGES

- **mocha framework:** \* Change api of `TestFramework`. It now provides an array of `TestSelection` objects, instead of an array of numbers with test ids.

<a name="0.8.1"></a>

## [0.8.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.8.0...stryker-mocha-runner@0.8.1) (2017-09-22)

### Bug Fixes

- **package.json:** Add dependency to tslib. ([#387](https://github.com/stryker-mutator/stryker/issues/387)) ([fcc8b88](https://github.com/stryker-mutator/stryker/commit/fcc8b88))

<a name="0.8.0"></a>

# [0.8.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.7.0...stryker-mocha-runner@0.8.0) (2017-09-19)

### Features

- **typescript:** Add support for TypeScript mutation testing (#376) ([ba78168](https://github.com/stryker-mutator/stryker/commit/ba78168))

### BREAKING CHANGES

- **typescript:** \* Hoist the `Mutator` interface to a higher abstraction. With this interface it was possible to add mutators for specific ES5 AST nodes. As we're moving away from ES5, this plugin abstraction had to be hoisted to a higher level. It is no longer possible to plugin a specific ES5 node mutator.
- Update `report` interface: Rename `MutantState.Error` => `MutantState.RuntimeError`.

<a name="0.7.0"></a>

# [0.7.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.6.0...stryker-mocha-runner@0.7.0) (2017-08-25)

### Bug Fixes

- **MochaTestRunner:** Exit with a warning if no tests were executed (#360) ([ac52860](https://github.com/stryker-mutator/stryker/commit/ac52860))

### Code Refactoring

- change ConfigWriter interface name to ConfigEditor (#357) ([ec4ae03](https://github.com/stryker-mutator/stryker/commit/ec4ae03))

### BREAKING CHANGES

- Public api for `ConfigWriter` is renamed to `ConfigEditor`. The corresponding `write` method is renamed to `edit`. If you're using custom `ConfigWriter` plugins you should rename the `write` method to `edit`. Please update the `stryker-mocha-framework` and `stryker-karma-runner` to the latest versions as they provide the new `ConfigEditor` plugin.

<a name="0.6.0"></a>

# [0.6.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.5.0...stryker-mocha-runner@0.6.0) (2017-08-11)

### Features

- **ci-integration:** Configurable thresholds based on mutation score (#355) ([93f28cc](https://github.com/stryker-mutator/stryker/commit/93f28cc)), closes [#220](https://github.com/stryker-mutator/stryker/issues/220)

<a name="0.5.0"></a>

## [0.5.0](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.4.4...stryker-mocha-runner@0.5.0) (2017-08-04)

<a name="0.4.4"></a>

## [0.4.4](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.4.3...stryker-mocha-runner@0.4.4) (2017-07-14)

<a name="0.4.3"></a>

## [0.4.3](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.4.2...stryker-mocha-runner@0.4.3) (2017-06-16)

### Bug Fixes

- **npmignore:** Align npm ignores (#321) ([db2a56e](https://github.com/stryker-mutator/stryker/commit/db2a56e))

<a name="0.4.1"></a>

## [0.4.1](https://github.com/stryker-mutator/stryker/compare/stryker-mocha-runner@0.4.0...stryker-mocha-runner@0.4.1) (2017-06-08)

<a name="0.3.0"></a>

# 0.3.0 (2017-04-21)

### Bug Fixes

- **deps:** Add stryker-api as peerDependency ([8b01a66](https://github.com/stryker-mutator/stryker/commit/8b01a66))
- **deps:** Add typings as dev-dependency ([4ee866a](https://github.com/stryker-mutator/stryker/commit/4ee866a))
- **deps:** Fix peer dependency version for mocha ([780ca90](https://github.com/stryker-mutator/stryker/commit/780ca90))
- **deps:** Remove unused dependency ([121a549](https://github.com/stryker-mutator/stryker/commit/121a549))
- **deps:** Remove unused dependency ([1f6dbba](https://github.com/stryker-mutator/stryker/commit/1f6dbba))
- **deps:** Set version of stryker api ([49a1384](https://github.com/stryker-mutator/stryker/commit/49a1384))
- **deps:** Update out dated dependencies ([cc0be9a](https://github.com/stryker-mutator/stryker/commit/cc0be9a))
- **deps:** Update outdated dependencies ([0fc17be](https://github.com/stryker-mutator/stryker/commit/0fc17be))
- **deps:** Update version stryker-api ([3a1a36c](https://github.com/stryker-mutator/stryker/commit/3a1a36c))
- **index:** Add file which loads the TestRunner ([55fd132](https://github.com/stryker-mutator/stryker/commit/55fd132))
- **TestRunner:** Add try-catch ([0c41fbf](https://github.com/stryker-mutator/stryker/commit/0c41fbf))
- **tslint:** Add linting ([9c360b2](https://github.com/stryker-mutator/stryker/commit/9c360b2))

### Features

- **es2015-promise:** Remove dep to es6-promise (#5) ([6f38885](https://github.com/stryker-mutator/stryker/commit/6f38885))
- **one-pass-coverage:** Update test runner (#4) ([6716519](https://github.com/stryker-mutator/stryker/commit/6716519))
- **ts2:** Migrate to typescript 2 ([0c9a655](https://github.com/stryker-mutator/stryker/commit/0c9a655))
- **unincluded-files:** Support unincluded files ([80297bc](https://github.com/stryker-mutator/stryker/commit/80297bc))

<a name="0.2.0"></a>

# [0.2.0](https://github.com/stryker-mutator/stryker-mocha-runner/compare/v0.1.1...v0.2.0) (2016-11-20)

### Features

- **one-pass-coverage:** Update test runner ([#4](https://github.com/stryker-mutator/stryker-mocha-runner/issues/4)) ([d6aebaa](https://github.com/stryker-mutator/stryker-mocha-runner/commit/d6aebaa))

<a name="0.1.1"></a>

## [0.1.1](https://github.com/stryker-mutator/stryker-mocha-runner/compare/v0.1.0...v0.1.1) (2016-10-03)

### Bug Fixes

- **deps:** Fix peer dependency version for mocha ([aa09049](https://github.com/stryker-mutator/stryker-mocha-runner/commit/aa09049))
- **deps:** Remove unused dependency ([88530be](https://github.com/stryker-mutator/stryker-mocha-runner/commit/88530be))
- **deps:** Remove unused dependency ([f3b4ff4](https://github.com/stryker-mutator/stryker-mocha-runner/commit/f3b4ff4))
- **deps:** Set version of stryker api ([c772fe0](https://github.com/stryker-mutator/stryker-mocha-runner/commit/c772fe0))
- **deps:** Update out dated dependencies ([c6e166f](https://github.com/stryker-mutator/stryker-mocha-runner/commit/c6e166f))
- **deps:** Update outdated dependencies ([d0e4eaf](https://github.com/stryker-mutator/stryker-mocha-runner/commit/d0e4eaf))
- **deps:** Update version stryker-api ([a632624](https://github.com/stryker-mutator/stryker-mocha-runner/commit/a632624))
- **tslint:** Add linting ([33e4c6e](https://github.com/stryker-mutator/stryker-mocha-runner/commit/33e4c6e))

### Features

- **ts2:** Migrate to typescript 2 ([bcd4064](https://github.com/stryker-mutator/stryker-mocha-runner/commit/bcd4064))

<a name="0.1.0"></a>

# [0.1.0](https://github.com/stryker-mutator/stryker-mocha-runner/compare/v0.0.2...v0.1.0) (2016-07-21)

<a name="0.0.2"></a>

## [0.0.2](https://github.com/stryker-mutator/stryker-mocha-runner/compare/v0.0.1...v0.0.2) (2016-07-19)

<a name="0.0.1"></a>

## [0.0.1](https://github.com/stryker-mutator/stryker-mocha-runner/compare/79aeabc...v0.0.1) (2016-07-19)

### Bug Fixes

- **deps:** Add stryker-api as peerDependency ([66aec0c](https://github.com/stryker-mutator/stryker-mocha-runner/commit/66aec0c))
- **deps:** Add typings as dev-dependency ([79aeabc](https://github.com/stryker-mutator/stryker-mocha-runner/commit/79aeabc))
- **index:** Add file which loads the TestRunner ([1be6179](https://github.com/stryker-mutator/stryker-mocha-runner/commit/1be6179))
- **TestRunner:** Add try-catch ([e589e53](https://github.com/stryker-mutator/stryker-mocha-runner/commit/e589e53))

### Features

- **unincluded-files:** Support unincluded files ([00ba196](https://github.com/stryker-mutator/stryker-mocha-runner/commit/00ba196))
