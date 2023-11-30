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

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

# [7.1.0](https://github.com/stryker-mutator/stryker-js/compare/v7.0.2...v7.1.0) (2023-06-24)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

## [7.0.2](https://github.com/stryker-mutator/stryker-js/compare/v7.0.1...v7.0.2) (2023-06-08)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

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

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

## [6.4.1](https://github.com/stryker-mutator/stryker-js/compare/v6.4.0...v6.4.1) (2023-02-17)

### Bug Fixes

- **deps:** set correct stryker peer dep version ([c88c537](https://github.com/stryker-mutator/stryker-js/commit/c88c537c61d03e50362e98e9dddc7569b0c88200))

# [6.4.0](https://github.com/stryker-mutator/stryker-js/compare/v6.3.1...v6.4.0) (2023-02-17)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

## [6.3.1](https://github.com/stryker-mutator/stryker-js/compare/v6.3.0...v6.3.1) (2022-12-18)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

# [6.3.0](https://github.com/stryker-mutator/stryker-js/compare/v6.2.3...v6.3.0) (2022-10-30)

### Features

- **ci:** forbid `.only` in CI pipeline tests ([#3823](https://github.com/stryker-mutator/stryker-js/issues/3823)) ([051ec93](https://github.com/stryker-mutator/stryker-js/commit/051ec937809468751a74c9e01cacd27ceb1acca2))

## [6.2.3](https://github.com/stryker-mutator/stryker-js/compare/v6.2.2...v6.2.3) (2022-10-10)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

## [6.2.2](https://github.com/stryker-mutator/stryker-js/compare/v6.2.1...v6.2.2) (2022-09-06)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

## [6.2.1](https://github.com/stryker-mutator/stryker-js/compare/v6.2.0...v6.2.1) (2022-09-06)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

# [6.2.0](https://github.com/stryker-mutator/stryker-js/compare/v6.1.2...v6.2.0) (2022-09-06)

### Features

- **incremental:** add incremental mode ([#3609](https://github.com/stryker-mutator/stryker-js/issues/3609)) ([82bea56](https://github.com/stryker-mutator/stryker-js/commit/82bea5604c81c1ccf76d44827ad3922cfb61463b))

# [6.2.0-beta.0](https://github.com/stryker-mutator/stryker-js/compare/v6.1.2...v6.2.0-beta.0) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

## [6.1.2](https://github.com/stryker-mutator/stryker-js/compare/v6.1.1...v6.1.2) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

## [6.1.1](https://github.com/stryker-mutator/stryker-js/compare/v6.1.0...v6.1.1) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

# [6.1.0](https://github.com/stryker-mutator/stryker-js/compare/v6.0.2...v6.1.0) (2022-06-27)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

## [6.0.2](https://github.com/stryker-mutator/stryker-js/compare/v6.0.1...v6.0.2) (2022-05-05)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

## [6.0.1](https://github.com/stryker-mutator/stryker-js/compare/v6.0.0...v6.0.1) (2022-05-04)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

# [6.0.0](https://github.com/stryker-mutator/stryker-js/compare/v6.0.0-beta.0...v6.0.0) (2022-05-03)

### chore

- **node:** drop support for Node 12 ([10d874e](https://github.com/stryker-mutator/stryker-js/commit/10d874e4c46335d9ea457634d3061af35fa8f854))

### BREAKING CHANGES

- **node:** Drop support for Node 12. Minimal version is now Node 14.18.0.

# [6.0.0-beta.0](https://github.com/stryker-mutator/stryker-js/compare/v5.6.1...v6.0.0-beta.0) (2022-03-02)

### Features

- **esm config:** support config file as pure esm ([#3432](https://github.com/stryker-mutator/stryker-js/issues/3432)) ([309a7e2](https://github.com/stryker-mutator/stryker-js/commit/309a7e2807e454a82f177de781bc4908f87c739b))
- **esm:** migrate StrykerJS to pure ESM ([#3409](https://github.com/stryker-mutator/stryker-js/issues/3409)) ([78c305e](https://github.com/stryker-mutator/stryker-js/commit/78c305e2c2271fedb54bfff3d34aa6b70b421b3a))
- **esm:** support native es modules in the jasmine runner. ([#3396](https://github.com/stryker-mutator/stryker-js/issues/3396)) ([94708d0](https://github.com/stryker-mutator/stryker-js/commit/94708d00b43e3f84accd42ccb40d95ff30718efa)), closes [#3340](https://github.com/stryker-mutator/stryker-js/issues/3340)
- **ignore static:** prevent leak of hybrid mutants ([#3443](https://github.com/stryker-mutator/stryker-js/issues/3443)) ([231049a](https://github.com/stryker-mutator/stryker-js/commit/231049a32f73083c7579b1bf8b4424ad309f655d))
- **reload test environment:** implement test environment reload ([#3369](https://github.com/stryker-mutator/stryker-js/issues/3369)) ([b95b907](https://github.com/stryker-mutator/stryker-js/commit/b95b907e54d3a114731a8bcf659a1910df4e4f0b))
- **test runner api:** `killedBy` is always an array ([#3187](https://github.com/stryker-mutator/stryker-js/issues/3187)) ([c257966](https://github.com/stryker-mutator/stryker-js/commit/c257966e6c7726e180e072c8ae7f3fd011485c05))

### BREAKING CHANGES

- **esm config:** Exporting a function (using `module.exports = function(config) {}`) from your `stryker.conf.js` file is no longer supported. This was already deprecated but now will give an error.
- **esm:** StrykerJS is now a pure ESM. Please [read this](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
- **esm:** Node 12.20 is now the min version.
- **esm:** Karma v6.3 is now the min supported karma version for `@stryker-mutator/karma-runner`, since [that version added support for async config loading](https://github.com/karma-runner/karma/blob/master/CHANGELOG.md#630-2021-03-23)
- **esm:** The `@stryker-mutator/jamsine-runner` now requires jasmine@3.10 or higher.
- **reload test environment:** Test runner plugins must provide `TestRunnerCapabilities` by implementing the `capabilities` method.

## [5.6.1](https://github.com/stryker-mutator/stryker-js/compare/v5.6.0...v5.6.1) (2022-01-23)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

# [5.6.0](https://github.com/stryker-mutator/stryker-js/compare/v5.5.1...v5.6.0) (2022-01-09)

### Bug Fixes

- **jasmine:** correct peer dependency for jasmine ([#3341](https://github.com/stryker-mutator/stryker-js/issues/3341)) ([07b50a9](https://github.com/stryker-mutator/stryker-js/commit/07b50a922b50fea64c978ab7023f8ea0486d9392))

## [5.5.1](https://github.com/stryker-mutator/stryker-js/compare/v5.5.0...v5.5.1) (2021-12-02)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

# [5.5.0](https://github.com/stryker-mutator/stryker-js/compare/v5.4.1...v5.5.0) (2021-11-23)

### Features

- **hit limit:** infinite loop prevention in jasmine-runner ([#3199](https://github.com/stryker-mutator/stryker-js/issues/3199)) ([bc792e0](https://github.com/stryker-mutator/stryker-js/commit/bc792e087225641256c95f18a6d70fefdca507b5))

## [5.4.1](https://github.com/stryker-mutator/stryker-js/compare/v5.4.0...v5.4.1) (2021-09-30)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

# [5.4.0](https://github.com/stryker-mutator/stryker-js/compare/v5.3.0...v5.4.0) (2021-09-01)

### Features

- **test runner:** Support for disable bail ([#3074](https://github.com/stryker-mutator/stryker-js/issues/3074)) ([0962232](https://github.com/stryker-mutator/stryker-js/commit/0962232fe2a181a2fde0067ed95f99885b8cee28))

# [5.3.0](https://github.com/stryker-mutator/stryker-js/compare/v5.2.3...v5.3.0) (2021-08-07)

### Features

- **hit limit:** infinite loop prevention in karma-runner ([#3031](https://github.com/stryker-mutator/stryker-js/issues/3031)) ([fc732fc](https://github.com/stryker-mutator/stryker-js/commit/fc732fce8838c96be2fdf37aff69b12c996d7cb0))

## [5.2.3](https://github.com/stryker-mutator/stryker-js/compare/v5.2.2...v5.2.3) (2021-08-01)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

## [5.2.2](https://github.com/stryker-mutator/stryker-js/compare/v5.2.1...v5.2.2) (2021-07-13)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

## [5.2.1](https://github.com/stryker-mutator/stryker-js/compare/v5.2.0...v5.2.1) (2021-07-02)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

# [5.2.0](https://github.com/stryker-mutator/stryker-js/compare/v5.1.1...v5.2.0) (2021-07-02)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

## [5.1.1](https://github.com/stryker-mutator/stryker-js/compare/v5.1.0...v5.1.1) (2021-06-15)

### Bug Fixes

- **peerDeps:** update peer dependencies ([05733d2](https://github.com/stryker-mutator/stryker-js/commit/05733d260d5ffc9eb1b3e284bdc4bc8adafc4d38))

# [5.1.0](https://github.com/stryker-mutator/stryker-js/compare/v5.0.1...v5.1.0) (2021-06-14)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

## [5.0.1](https://github.com/stryker-mutator/stryker-js/compare/v5.0.0...v5.0.1) (2021-05-28)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

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

### Features

- **package:** restructure package internals ([#2714](https://github.com/stryker-mutator/stryker/issues/2714)) ([e1711d2](https://github.com/stryker-mutator/stryker/commit/e1711d28f25e8ee7cbdf025adecb3234ee0515a6))

## [4.4.1](https://github.com/stryker-mutator/stryker/compare/v4.4.0...v4.4.1) (2021-01-27)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

# [4.4.0](https://github.com/stryker-mutator/stryker/compare/v4.3.1...v4.4.0) (2021-01-24)

### Bug Fixes

- **jasmine:** support jasmine >3.6.2 ([#2594](https://github.com/stryker-mutator/stryker/issues/2594)) ([582079b](https://github.com/stryker-mutator/stryker/commit/582079b97dbe7ad2526a6815740d452da66a8617))

## [4.3.1](https://github.com/stryker-mutator/stryker/compare/v4.3.0...v4.3.1) (2020-12-25)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

# [4.3.0](https://github.com/stryker-mutator/stryker/compare/v4.2.0...v4.3.0) (2020-12-25)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

# [4.2.0](https://github.com/stryker-mutator/stryker/compare/v4.1.2...v4.2.0) (2020-12-09)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

## [4.1.2](https://github.com/stryker-mutator/stryker/compare/v4.1.1...v4.1.2) (2020-11-06)

### Bug Fixes

- **peerDeps:** update core in peerDependencies ([045dbc3](https://github.com/stryker-mutator/stryker/commit/045dbc3742c123658f4cf9ab2786b20ffd89a8cf))

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

- **config:** deprecate function based config ([#2499](https://github.com/stryker-mutator/stryker/issues/2499)) ([8ea3c18](https://github.com/stryker-mutator/stryker/commit/8ea3c18421929a0724ff99e5bf02ce0f174266cd))

### BREAKING CHANGES

- **config:** exporting a function from stryker.conf.js is deprecated. Please export your config as an object instead, or use a stryker.conf.json file.

Co-authored-by: Nico Jansen <jansennico@gmail.com>

# [4.0.0-beta.8](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.7...v4.0.0-beta.8) (2020-09-22)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

# [4.0.0-beta.7](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2020-09-17)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

# [4.0.0-beta.6](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2020-09-10)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

# [4.0.0-beta.5](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2020-09-09)

### Bug Fixes

- **jasmine-runner:** fix memory leaks ([457d807](https://github.com/stryker-mutator/stryker/commit/457d807989bd2a69a9e1b7bc33c3971a37c19737))

# [4.0.0-beta.4](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2020-08-29)

### Features

- **api:** rename test_runner2 -> test_runner ([#2442](https://github.com/stryker-mutator/stryker/issues/2442)) ([4d3ae97](https://github.com/stryker-mutator/stryker/commit/4d3ae9764dbd689c895b76e44f2eea76c82fabc8))
- **test-runner:** add `nrOfTests` metric ([0eea448](https://github.com/stryker-mutator/stryker/commit/0eea44892e2383e8b0a34c6267e2f455d604f55a))

### BREAKING CHANGES

- **api:** Plugin creators should now use `'test_runner'` instead of `'test_runner2'`.

# [4.0.0-beta.3](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2020-08-19)

### Features

- **test runner api:** remove `sandboxFileNames` injectable values ([#2369](https://github.com/stryker-mutator/stryker/issues/2369)) ([92f3bf5](https://github.com/stryker-mutator/stryker/commit/92f3bf528d0b01be1f6c219b37a5f90da0431686)), closes [#2351](https://github.com/stryker-mutator/stryker/issues/2351)

# [4.0.0-beta.2](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2020-08-07)

### Features

- **jest-runner:** support mutation switching ([#2350](https://github.com/stryker-mutator/stryker/issues/2350)) ([9e6e6e0](https://github.com/stryker-mutator/stryker/commit/9e6e6e077731344ed0588d64b5c8ba2f19c8492e))

# [4.0.0-beta.1](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2020-07-17)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

# [4.0.0-beta.0](https://github.com/stryker-mutator/stryker/compare/v3.3.1...v4.0.0-beta.0) (2020-07-10)

### Bug Fixes

- **jasmine-runner:** update deprecated api calls ([#2250](https://github.com/stryker-mutator/stryker/issues/2250)) ([b6d6dfd](https://github.com/stryker-mutator/stryker/commit/b6d6dfdabf8db748660b9818415864de27d55a7f))

### Features

- **jasmine-runner:** implement new test runner api ([#2256](https://github.com/stryker-mutator/stryker/issues/2256)) ([871db8c](https://github.com/stryker-mutator/stryker/commit/871db8c24c3389133d9b4476acd33b0ddd956a36)), closes [#2249](https://github.com/stryker-mutator/stryker/issues/2249)

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

- **validation:** add validation on plugin options ([#2158](https://github.com/stryker-mutator/stryker/issues/2158)) ([d78fe1e](https://github.com/stryker-mutator/stryker/commit/d78fe1e013ac2e309a29f0def3029492b1e6c1ea))

# [3.1.0](https://github.com/stryker-mutator/stryker/compare/v3.0.2...v3.1.0) (2020-03-29)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

## [3.0.2](https://github.com/stryker-mutator/stryker/compare/v3.0.1...v3.0.2) (2020-03-13)

### Bug Fixes

- **nodejs requirement:** set NodeJS requirement to at least Node 10 ([8c08059](https://github.com/stryker-mutator/stryker/commit/8c080594a87d638ea4349ee69e05ed6c7eba6463))

## [3.0.1](https://github.com/stryker-mutator/stryker/compare/v3.0.0...v3.0.1) (2020-03-12)

### Bug Fixes

- **Peer dependencies:** set peer dependencies for v3 ([#2096](https://github.com/stryker-mutator/stryker/issues/2096)) ([8648c4d](https://github.com/stryker-mutator/stryker/commit/8648c4d9c70ce032841371c6041ebb76bf099948)), closes [#2095](https://github.com/stryker-mutator/stryker/issues/2095)

# [3.0.0](https://github.com/stryker-mutator/stryker/compare/v2.5.0...v3.0.0) (2020-03-11)

### Bug Fixes

- **mocha:** support mutants with "runAllTests" ([#2037](https://github.com/stryker-mutator/stryker/issues/2037)) ([a9da18a](https://github.com/stryker-mutator/stryker/commit/a9da18aa67845db943c5ce8ebd69b368b34e134e)), closes [#2032](https://github.com/stryker-mutator/stryker/issues/2032)

### Features

- **Initializer:** Initialize config file as JSON by default ([#2093](https://github.com/stryker-mutator/stryker/issues/2093)) ([e07d953](https://github.com/stryker-mutator/stryker/commit/e07d9535084881180d5abf7b58bece1b65f2455f)), closes [#2000](https://github.com/stryker-mutator/stryker/issues/2000)

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

- **node 6:** drop support for node 6 ([#1517](https://github.com/stryker-mutator/stryker/issues/1517)) ([801d7cd](https://github.com/stryker-mutator/stryker/commit/801d7cd))

### BREAKING CHANGES

- **node 6:** support for Node 6 has been dropped. Node 8 or higher is now required.

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

- **stryker init:** update metadata for `stryker init` command ([#1403](https://github.com/stryker-mutator/stryker/issues/1403)) ([38f269b](https://github.com/stryker-mutator/stryker/commit/38f269b)), closes [#1402](https://github.com/stryker-mutator/stryker/issues/1402)

## [1.0.1](https://github.com/stryker-mutator/stryker/compare/v1.0.0...v1.0.1) (2019-02-13)

**Note:** Version bump only for package @stryker-mutator/jasmine-runner

## [1.0.0](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.4.1...@stryker-mutator/jasmine-runner@1.0.0) (2019-02-13)

### Features

- **rename:** rename `stryker-xxx-xxx` -> `[@stryker-mutator](https://github.com/stryker-mutator)/xxx-xxx` ([1bbd6ff](https://github.com/stryker-mutator/stryker/commit/1bbd6ff))

### BREAKING CHANGES

- **rename:** The core package and plugins have been renamed: stryker-jasmine-runner -> @stryker-mutator/jasmine-runner

## [0.4.1](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.4.0...stryker-jasmine-runner@0.4.1) (2019-02-12)

**Note:** Version bump only for package stryker-jasmine-runner

# [0.4.0](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.3.0...stryker-jasmine-runner@0.4.0) (2019-02-08)

### Features

- **dependency injection:** Add dependency injection for plugins ([#1313](https://github.com/stryker-mutator/stryker/issues/1313)) ([f90cd56](https://github.com/stryker-mutator/stryker/commit/f90cd56)), closes [#667](https://github.com/stryker-mutator/stryker/issues/667)
- **port:** Deprecate property 'port' ([#1309](https://github.com/stryker-mutator/stryker/issues/1309)) ([2539ee0](https://github.com/stryker-mutator/stryker/commit/2539ee0))
- **test-runner:** Use new plugin system to load TestRunner plugins ([#1361](https://github.com/stryker-mutator/stryker/issues/1361)) ([266247b](https://github.com/stryker-mutator/stryker/commit/266247b))

<a name="0.3.0"></a>

# [0.3.0](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.2.9...stryker-jasmine-runner@0.3.0) (2018-12-23)

### Features

- **stryker-api:** Support stryker-api 0.23 ([#1293](https://github.com/stryker-mutator/stryker/issues/1293)) ([10720ad](https://github.com/stryker-mutator/stryker/commit/10720ad))

<a name="0.2.9"></a>

## [0.2.9](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.2.8...stryker-jasmine-runner@0.2.9) (2018-12-12)

**Note:** Version bump only for package stryker-jasmine-runner

<a name="0.2.8"></a>

## [0.2.8](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.2.7...stryker-jasmine-runner@0.2.8) (2018-11-29)

### Bug Fixes

- **stryker-api:** Update stryker-api peer dependency version ([677fc28](https://github.com/stryker-mutator/stryker/commit/677fc28))

<a name="0.2.7"></a>

## [0.2.7](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.2.6...stryker-jasmine-runner@0.2.7) (2018-11-29)

**Note:** Version bump only for package stryker-jasmine-runner

<a name="0.2.6"></a>

## [0.2.6](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.2.5...stryker-jasmine-runner@0.2.6) (2018-11-13)

**Note:** Version bump only for package stryker-jasmine-runner

<a name="0.2.5"></a>

## [0.2.5](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.2.3...stryker-jasmine-runner@0.2.5) (2018-10-15)

### Bug Fixes

- **version:** Version bump for failed release ([8cf9e87](https://github.com/stryker-mutator/stryker/commit/8cf9e87))

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

- **stryker config:** rename config setting `reporter` to `reporters` ([#1088](https://github.com/stryker-mutator/stryker/issues/1088)) ([584218a](https://github.com/stryker-mutator/stryker/commit/584218a)), closes [#793](https://github.com/stryker-mutator/stryker/issues/793)

<a name="0.1.2"></a>

## [0.1.2](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.1.1...stryker-jasmine-runner@0.1.2) (2018-08-17)

### Bug Fixes

- **dependencies:** support stryker-api 0.19.0 ([#1087](https://github.com/stryker-mutator/stryker/issues/1087)) ([44ce923](https://github.com/stryker-mutator/stryker/commit/44ce923))

<a name="0.1.1"></a>

## [0.1.1](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.1.0...stryker-jasmine-runner@0.1.1) (2018-08-17)

**Note:** Version bump only for package stryker-jasmine-runner

<a name="0.1.0"></a>

# [0.1.0](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.0.3...stryker-jasmine-runner@0.1.0) (2018-07-20)

### Bug Fixes

- **Dependencies:** Pin all deps on minor version ([#974](https://github.com/stryker-mutator/stryker/issues/974)) ([f0a7e5a](https://github.com/stryker-mutator/stryker/commit/f0a7e5a)), closes [#954](https://github.com/stryker-mutator/stryker/issues/954) [#967](https://github.com/stryker-mutator/stryker/issues/967)

### Features

- **logging:** Allow log to a file ([#954](https://github.com/stryker-mutator/stryker/issues/954)) ([c2f6b82](https://github.com/stryker-mutator/stryker/commit/c2f6b82)), closes [#748](https://github.com/stryker-mutator/stryker/issues/748)

<a name="0.0.3"></a>

## [0.0.3](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.0.2...stryker-jasmine-runner@0.0.3) (2018-07-04)

**Note:** Version bump only for package stryker-jasmine-runner

<a name="0.0.2"></a>

## [0.0.2](https://github.com/stryker-mutator/stryker/compare/stryker-jasmine-runner@0.0.1...stryker-jasmine-runner@0.0.2) (2018-05-31)

**Note:** Version bump only for package stryker-jasmine-runner

<a name="0.0.1"></a>

## 0.0.1 (2018-05-21)

**Note:** Version bump only for package stryker-jasmine-runner
