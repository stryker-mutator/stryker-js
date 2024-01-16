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

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [7.0.2](https://github.com/stryker-mutator/stryker-js/compare/v7.0.1...v7.0.2) (2023-06-08)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [7.0.1](https://github.com/stryker-mutator/stryker-js/compare/v7.0.0...v7.0.1) (2023-06-03)

### Bug Fixes

- **deps:** update `@stryker-mutator/core` peer dep ([9dd4a76](https://github.com/stryker-mutator/stryker-js/commit/9dd4a767d30830861a3e997266a6491fae799acd))

# [7.0.0](https://github.com/stryker-mutator/stryker-js/compare/v6.4.2...v7.0.0) (2023-06-02)

### Bug Fixes

- **deps:** update dependency semver to v7.4.0 ([#4101](https://github.com/stryker-mutator/stryker-js/issues/4101)) ([c317294](https://github.com/stryker-mutator/stryker-js/commit/c3172941d5c8718f589fdaad9746033c1cf7e6fc))
- **deps:** update dependency semver to v7.5.0 ([#4121](https://github.com/stryker-mutator/stryker-js/issues/4121)) ([4c8dade](https://github.com/stryker-mutator/stryker-js/commit/4c8dade076b18d9e4792fef2028d4b0c93ea27bb))

### chore

- **esm:** use "exports" and module "Node16" ([#4171](https://github.com/stryker-mutator/stryker-js/issues/4171)) ([cdf4a34](https://github.com/stryker-mutator/stryker-js/commit/cdf4a342b73d922423eb46a919eb3b38c4c43c46))

### Features

- **node:** Drop support for node 14 ([#4105](https://github.com/stryker-mutator/stryker-js/issues/4105)) ([a88744f](https://github.com/stryker-mutator/stryker-js/commit/a88744f1a5fa47274ee0f30abc635831b18113fa))

### BREAKING CHANGES

- **esm:** Deep (and undocumented) imports from `@stryker-mutator/core` or one of the plugins will no longer work. If you want to import something that's not available, please let us know by [opening an issue](https://github.com/stryker-mutator/stryker-js/issues/new/choose)
- **node:** Node 14 is no longer supported. Please install an LTS version of node: nodejs.org/

## [6.4.2](https://github.com/stryker-mutator/stryker-js/compare/v6.4.1...v6.4.2) (2023-03-24)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [6.4.1](https://github.com/stryker-mutator/stryker-js/compare/v6.4.0...v6.4.1) (2023-02-17)

### Bug Fixes

- **deps:** set correct stryker peer dep version ([c88c537](https://github.com/stryker-mutator/stryker-js/commit/c88c537c61d03e50362e98e9dddc7569b0c88200))

# [6.4.0](https://github.com/stryker-mutator/stryker-js/compare/v6.3.1...v6.4.0) (2023-02-17)

### Bug Fixes

- **deps:** update dependency tslib to ~2.5.0 ([#3952](https://github.com/stryker-mutator/stryker-js/issues/3952)) ([7548287](https://github.com/stryker-mutator/stryker-js/commit/7548287ee000bc09f88e6f1f0848e6e8e625bbb5))

## [6.3.1](https://github.com/stryker-mutator/stryker-js/compare/v6.3.0...v6.3.1) (2022-12-18)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [6.3.0](https://github.com/stryker-mutator/stryker-js/compare/v6.2.3...v6.3.0) (2022-10-30)

### Bug Fixes

- **karma-runner:** support zero-mutant runs ([#3787](https://github.com/stryker-mutator/stryker-js/issues/3787)) ([c6a9219](https://github.com/stryker-mutator/stryker-js/commit/c6a9219017b509241d6388654e93896d98cc31aa))

### Features

- **ci:** forbid `.only` in CI pipeline tests ([#3823](https://github.com/stryker-mutator/stryker-js/issues/3823)) ([051ec93](https://github.com/stryker-mutator/stryker-js/commit/051ec937809468751a74c9e01cacd27ceb1acca2))

## [6.2.3](https://github.com/stryker-mutator/stryker-js/compare/v6.2.2...v6.2.3) (2022-10-10)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [6.2.2](https://github.com/stryker-mutator/stryker-js/compare/v6.2.1...v6.2.2) (2022-09-06)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [6.2.1](https://github.com/stryker-mutator/stryker-js/compare/v6.2.0...v6.2.1) (2022-09-06)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [6.2.0](https://github.com/stryker-mutator/stryker-js/compare/v6.1.2...v6.2.0) (2022-09-06)

### Features

- **incremental:** add incremental mode ([#3609](https://github.com/stryker-mutator/stryker-js/issues/3609)) ([82bea56](https://github.com/stryker-mutator/stryker-js/commit/82bea5604c81c1ccf76d44827ad3922cfb61463b))

# [6.2.0-beta.0](https://github.com/stryker-mutator/stryker-js/compare/v6.1.2...v6.2.0-beta.0) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [6.1.2](https://github.com/stryker-mutator/stryker-js/compare/v6.1.1...v6.1.2) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [6.1.1](https://github.com/stryker-mutator/stryker-js/compare/v6.1.0...v6.1.1) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [6.1.0](https://github.com/stryker-mutator/stryker-js/compare/v6.0.2...v6.1.0) (2022-06-27)

### Bug Fixes

- **deps:** update dependency semver to v7.3.7 ([#3532](https://github.com/stryker-mutator/stryker-js/issues/3532)) ([2dce631](https://github.com/stryker-mutator/stryker-js/commit/2dce631e25c586ebf2344df815bc9a4a3dda6004))

## [6.0.2](https://github.com/stryker-mutator/stryker-js/compare/v6.0.1...v6.0.2) (2022-05-05)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [6.0.1](https://github.com/stryker-mutator/stryker-js/compare/v6.0.0...v6.0.1) (2022-05-04)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [6.0.0](https://github.com/stryker-mutator/stryker-js/compare/v6.0.0-beta.0...v6.0.0) (2022-05-03)

### Bug Fixes

- **karma-runner:** allow dispose during init ([#3487](https://github.com/stryker-mutator/stryker-js/issues/3487)) ([4fcf148](https://github.com/stryker-mutator/stryker-js/commit/4fcf14837ae466e47653e5e88f1b5b79cd936746))

### chore

- **node:** drop support for Node 12 ([10d874e](https://github.com/stryker-mutator/stryker-js/commit/10d874e4c46335d9ea457634d3061af35fa8f854))

### BREAKING CHANGES

- **node:** Drop support for Node 12. Minimal version is now Node 14.18.0.

# [6.0.0-beta.0](https://github.com/stryker-mutator/stryker-js/compare/v5.6.1...v6.0.0-beta.0) (2022-03-02)

### Features

- **esm config:** support config file as pure esm ([#3432](https://github.com/stryker-mutator/stryker-js/issues/3432)) ([309a7e2](https://github.com/stryker-mutator/stryker-js/commit/309a7e2807e454a82f177de781bc4908f87c739b))
- **esm:** migrate StrykerJS to pure ESM ([#3409](https://github.com/stryker-mutator/stryker-js/issues/3409)) ([78c305e](https://github.com/stryker-mutator/stryker-js/commit/78c305e2c2271fedb54bfff3d34aa6b70b421b3a))
- **karma-runner:** support async karma configuration ([#3433](https://github.com/stryker-mutator/stryker-js/issues/3433)) ([7204a43](https://github.com/stryker-mutator/stryker-js/commit/7204a431fb526785029d9d87eadbdadfc0e3ddcd)), closes [/github.com/karma-runner/karma/blob/master/CHANGELOG.md#630-2021-03-23](https://github.com//github.com/karma-runner/karma/blob/master/CHANGELOG.md/issues/630-2021-03-23)
- **reload test environment:** implement test environment reload ([#3369](https://github.com/stryker-mutator/stryker-js/issues/3369)) ([b95b907](https://github.com/stryker-mutator/stryker-js/commit/b95b907e54d3a114731a8bcf659a1910df4e4f0b))
- **test runner api:** `killedBy` is always an array ([#3187](https://github.com/stryker-mutator/stryker-js/issues/3187)) ([c257966](https://github.com/stryker-mutator/stryker-js/commit/c257966e6c7726e180e072c8ae7f3fd011485c05))

### BREAKING CHANGES

- **esm config:** Exporting a function (using `module.exports = function(config) {}`) from your `stryker.conf.js` file is no longer supported. This was already deprecated but now will give an error.
- **esm:** StrykerJS is now a pure ESM. Please [read this](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
- **esm:** Node 12.20 is now the min version.
- **esm:** Karma v6.3 is now the min supported karma version for `@stryker-mutator/karma-runner`, since [that version added support for async config loading](https://github.com/karma-runner/karma/blob/master/CHANGELOG.md#630-2021-03-23)
- **reload test environment:** Test runner plugins must provide `TestRunnerCapabilities` by implementing the `capabilities` method.

## [5.6.1](https://github.com/stryker-mutator/stryker-js/compare/v5.6.0...v5.6.1) (2022-01-23)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [5.6.0](https://github.com/stryker-mutator/stryker-js/compare/v5.5.1...v5.6.0) (2022-01-09)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [5.5.1](https://github.com/stryker-mutator/stryker-js/compare/v5.5.0...v5.5.1) (2021-12-02)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [5.5.0](https://github.com/stryker-mutator/stryker-js/compare/v5.4.1...v5.5.0) (2021-11-23)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [5.4.1](https://github.com/stryker-mutator/stryker-js/compare/v5.4.0...v5.4.1) (2021-09-30)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [5.4.0](https://github.com/stryker-mutator/stryker-js/compare/v5.3.0...v5.4.0) (2021-09-01)

### Features

- **test runner:** Support for disable bail ([#3074](https://github.com/stryker-mutator/stryker-js/issues/3074)) ([0962232](https://github.com/stryker-mutator/stryker-js/commit/0962232fe2a181a2fde0067ed95f99885b8cee28))

# [5.3.0](https://github.com/stryker-mutator/stryker-js/compare/v5.2.3...v5.3.0) (2021-08-07)

### Features

- **hit limit:** infinite loop prevention in karma-runner ([#3031](https://github.com/stryker-mutator/stryker-js/issues/3031)) ([fc732fc](https://github.com/stryker-mutator/stryker-js/commit/fc732fce8838c96be2fdf37aff69b12c996d7cb0))

## [5.2.3](https://github.com/stryker-mutator/stryker-js/compare/v5.2.2...v5.2.3) (2021-08-01)

### Bug Fixes

- **karma runner:** restart a browser on disconnect error ([#3020](https://github.com/stryker-mutator/stryker-js/issues/3020)) ([fc5c449](https://github.com/stryker-mutator/stryker-js/commit/fc5c449ba329d7a8b07d47193d4916cb28d47bb1))

## [5.2.2](https://github.com/stryker-mutator/stryker-js/compare/v5.2.1...v5.2.2) (2021-07-13)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [5.2.1](https://github.com/stryker-mutator/stryker-js/compare/v5.2.0...v5.2.1) (2021-07-02)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [5.2.0](https://github.com/stryker-mutator/stryker-js/compare/v5.1.1...v5.2.0) (2021-07-02)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [5.1.1](https://github.com/stryker-mutator/stryker-js/compare/v5.1.0...v5.1.1) (2021-06-15)

### Bug Fixes

- **peerDeps:** update peer dependencies ([05733d2](https://github.com/stryker-mutator/stryker-js/commit/05733d260d5ffc9eb1b3e284bdc4bc8adafc4d38))

# [5.1.0](https://github.com/stryker-mutator/stryker-js/compare/v5.0.1...v5.1.0) (2021-06-14)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [5.0.1](https://github.com/stryker-mutator/stryker-js/compare/v5.0.0...v5.0.1) (2021-05-28)

**Note:** Version bump only for package @stryker-mutator/karma-runner

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

## [4.5.1](https://github.io/stryker-mutator/stryker/compare/v4.5.0...v4.5.1) (2021-03-11)

### Bug Fixes

- **peer-deps:** use correct peer dep version ([a6ca0f2](https://github.io/stryker-mutator/stryker/commit/a6ca0f25b29cb84a2cb4b8c05a42e7305d5dde16))

# [4.5.0](https://github.io/stryker-mutator/stryker/compare/v4.4.1...v4.5.0) (2021-03-06)

### Features

- **package:** restructure package internals ([#2714](https://github.io/stryker-mutator/stryker/issues/2714)) ([e1711d2](https://github.io/stryker-mutator/stryker/commit/e1711d28f25e8ee7cbdf025adecb3234ee0515a6))

## [4.4.1](https://github.io/stryker-mutator/stryker/compare/v4.4.0...v4.4.1) (2021-01-27)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [4.4.0](https://github.io/stryker-mutator/stryker/compare/v4.3.1...v4.4.0) (2021-01-24)

### Features

- **in place:** support in place mutation ([#2706](https://github.io/stryker-mutator/stryker/issues/2706)) ([2685a7e](https://github.io/stryker-mutator/stryker/commit/2685a7eb86c808c363aad3151f2c67f273bdf314))

## [4.3.1](https://github.io/stryker-mutator/stryker/compare/v4.3.0...v4.3.1) (2020-12-25)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [4.3.0](https://github.io/stryker-mutator/stryker/compare/v4.2.0...v4.3.0) (2020-12-25)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [4.2.0](https://github.io/stryker-mutator/stryker/compare/v4.1.2...v4.2.0) (2020-12-09)

### Features

- **karma-runner:** resolve local karma and ng version ([#2622](https://github.io/stryker-mutator/stryker/issues/2622)) ([5b92130](https://github.io/stryker-mutator/stryker/commit/5b921302787a526377be02a37eb43a487c8f283d))

## [4.1.2](https://github.io/stryker-mutator/stryker/compare/v4.1.1...v4.1.2) (2020-11-06)

### Bug Fixes

- **peerDeps:** update core in peerDependencies ([045dbc3](https://github.io/stryker-mutator/stryker/commit/045dbc3742c123658f4cf9ab2786b20ffd89a8cf))

## [4.1.1](https://github.io/stryker-mutator/stryker/compare/v4.1.0...v4.1.1) (2020-11-05)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [4.1.0](https://github.io/stryker-mutator/stryker/compare/v4.0.0...v4.1.0) (2020-10-30)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [4.0.0](https://github.io/stryker-mutator/stryker/compare/v4.0.0-beta.10...v4.0.0) (2020-10-07)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [4.0.0-beta.10](https://github.io/stryker-mutator/stryker/compare/v4.0.0-beta.9...v4.0.0-beta.10) (2020-10-05)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [4.0.0-beta.9](https://github.io/stryker-mutator/stryker/compare/v4.0.0-beta.8...v4.0.0-beta.9) (2020-09-30)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [4.0.0-beta.8](https://github.io/stryker-mutator/stryker/compare/v4.0.0-beta.7...v4.0.0-beta.8) (2020-09-22)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [4.0.0-beta.7](https://github.io/stryker-mutator/stryker/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2020-09-17)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [4.0.0-beta.6](https://github.io/stryker-mutator/stryker/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2020-09-10)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [4.0.0-beta.5](https://github.io/stryker-mutator/stryker/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2020-09-09)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [4.0.0-beta.4](https://github.io/stryker-mutator/stryker/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2020-08-29)

### Features

- **api:** rename test_runner2 -> test_runner ([#2442](https://github.io/stryker-mutator/stryker/issues/2442)) ([4d3ae97](https://github.io/stryker-mutator/stryker/commit/4d3ae9764dbd689c895b76e44f2eea76c82fabc8))
- **karma-runner:** force bail = true in all cases ([ba928a1](https://github.io/stryker-mutator/stryker/commit/ba928a10d9e4c67ade9648927fb6b281ad2e3d55))

### BREAKING CHANGES

- **api:** Plugin creators should now use `'test_runner'` instead of `'test_runner2'`.

# [4.0.0-beta.3](https://github.io/stryker-mutator/stryker/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2020-08-19)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [4.0.0-beta.2](https://github.io/stryker-mutator/stryker/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2020-08-07)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [4.0.0-beta.1](https://github.io/stryker-mutator/stryker/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2020-07-17)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [4.0.0-beta.0](https://github.io/stryker-mutator/stryker/compare/v3.3.1...v4.0.0-beta.0) (2020-07-10)

### Bug Fixes

- **karma-runner:** mocha filtering with `/` ([#2290](https://github.io/stryker-mutator/stryker/issues/2290)) ([3918633](https://github.io/stryker-mutator/stryker/commit/3918633b21ff37d2e950df2cc14b8557ee7eb6b3))

## [3.3.1](https://github.io/stryker-mutator/stryker/compare/v3.3.0...v3.3.1) (2020-07-04)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [3.3.0](https://github.io/stryker-mutator/stryker/compare/v3.2.4...v3.3.0) (2020-06-16)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [3.2.4](https://github.io/stryker-mutator/stryker/compare/v3.2.3...v3.2.4) (2020-05-18)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [3.2.3](https://github.io/stryker-mutator/stryker/compare/v3.2.2...v3.2.3) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [3.2.2](https://github.io/stryker-mutator/stryker/compare/v3.2.1...v3.2.2) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [3.2.1](https://github.io/stryker-mutator/stryker/compare/v3.2.0...v3.2.1) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [3.2.0](https://github.io/stryker-mutator/stryker/compare/v3.1.0...v3.2.0) (2020-05-13)

### Features

- **validation:** add validation on plugin options ([#2158](https://github.io/stryker-mutator/stryker/issues/2158)) ([d78fe1e](https://github.io/stryker-mutator/stryker/commit/d78fe1e013ac2e309a29f0def3029492b1e6c1ea))

# [3.1.0](https://github.io/stryker-mutator/stryker/compare/v3.0.2...v3.1.0) (2020-03-29)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [3.0.2](https://github.io/stryker-mutator/stryker/compare/v3.0.1...v3.0.2) (2020-03-13)

### Bug Fixes

- **nodejs requirement:** set NodeJS requirement to at least Node 10 ([8c08059](https://github.io/stryker-mutator/stryker/commit/8c080594a87d638ea4349ee69e05ed6c7eba6463))

## [3.0.1](https://github.io/stryker-mutator/stryker/compare/v3.0.0...v3.0.1) (2020-03-12)

### Bug Fixes

- **Peer dependencies:** set peer dependencies for v3 ([#2096](https://github.io/stryker-mutator/stryker/issues/2096)) ([8648c4d](https://github.io/stryker-mutator/stryker/commit/8648c4d9c70ce032841371c6041ebb76bf099948)), closes [#2095](https://github.io/stryker-mutator/stryker/issues/2095)

# [3.0.0](https://github.io/stryker-mutator/stryker/compare/v2.5.0...v3.0.0) (2020-03-11)

### Bug Fixes

- **mocha:** support mutants with "runAllTests" ([#2037](https://github.io/stryker-mutator/stryker/issues/2037)) ([a9da18a](https://github.io/stryker-mutator/stryker/commit/a9da18aa67845db943c5ce8ebd69b368b34e134e)), closes [#2032](https://github.io/stryker-mutator/stryker/issues/2032)

### Features

- **Initializer:** Initialize config file as JSON by default ([#2093](https://github.io/stryker-mutator/stryker/issues/2093)) ([e07d953](https://github.io/stryker-mutator/stryker/commit/e07d9535084881180d5abf7b58bece1b65f2455f)), closes [#2000](https://github.io/stryker-mutator/stryker/issues/2000)
- **karma-runner:** disable client.clearContext ([#2048](https://github.io/stryker-mutator/stryker/issues/2048)) ([27c0787](https://github.io/stryker-mutator/stryker/commit/27c0787e1b5e9b886dc530afcb0de19637e308c6))
- **karma-runner:** use ChromeHeadless as the default browser ([#2035](https://github.io/stryker-mutator/stryker/issues/2035)) ([18bf9b6](https://github.io/stryker-mutator/stryker/commit/18bf9b603fdc0b4b0049c32dfaf953603980a662))

### BREAKING CHANGES

- **karma-runner:** The @stryker-mutator/karma-runner will now use ChromeHeadless by default (instead of PhantomJS)

# [2.5.0](https://github.io/stryker-mutator/stryker/compare/v2.4.0...v2.5.0) (2020-01-12)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [2.4.0](https://github.io/stryker-mutator/stryker/compare/v2.3.0...v2.4.0) (2019-11-24)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [2.3.0](https://github.io/stryker-mutator/stryker/compare/v2.2.1...v2.3.0) (2019-11-13)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [2.2.1](https://github.io/stryker-mutator/stryker/compare/v2.2.0...v2.2.1) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [2.2.0](https://github.io/stryker-mutator/stryker/compare/v2.1.0...v2.2.0) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [2.1.0](https://github.io/stryker-mutator/stryker/compare/v2.0.2...v2.1.0) (2019-09-08)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [2.0.2](https://github.io/stryker-mutator/stryker/compare/v2.0.1...v2.0.2) (2019-07-11)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [2.0.1](https://github.io/stryker-mutator/stryker/compare/v2.0.0...v2.0.1) (2019-07-02)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [2.0.0](https://github.io/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)

### Features

- **es2017:** output es2017 code ([#1518](https://github.io/stryker-mutator/stryker/issues/1518)) ([e85561e](https://github.io/stryker-mutator/stryker/commit/e85561e))
- **node 6:** drop support for node 6 ([#1517](https://github.io/stryker-mutator/stryker/issues/1517)) ([801d7cd](https://github.io/stryker-mutator/stryker/commit/801d7cd))

### BREAKING CHANGES

- **es2017:** changed TypeScript output target from es5 to es2017. This requires a NodeJS runtime of version 8 or higher.
- **node 6:** support for Node 6 has been dropped. Node 8 or higher is now required.

## [1.3.1](https://github.io/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [1.3.0](https://github.io/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [1.2.0](https://github.io/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [1.1.1](https://github.io/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)

**Note:** Version bump only for package @stryker-mutator/karma-runner

# [1.1.0](https://github.io/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [1.0.3](https://github.io/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [1.0.2](https://github.io/stryker-mutator/stryker/compare/v1.0.1...v1.0.2) (2019-02-13)

### Bug Fixes

- **stryker init:** update metadata for `stryker init` command ([#1403](https://github.io/stryker-mutator/stryker/issues/1403)) ([38f269b](https://github.io/stryker-mutator/stryker/commit/38f269b)), closes [#1402](https://github.io/stryker-mutator/stryker/issues/1402)

## [1.0.1](https://github.io/stryker-mutator/stryker/compare/v1.0.0...v1.0.1) (2019-02-13)

**Note:** Version bump only for package @stryker-mutator/karma-runner

## [1.0.0](https://github.com/stryker-mutator/stryker/compare/stryker-karma-runner@0.24.1...@stryker-mutator/karma-runner@1.0.0) (2019-02-13)

### Features

- **karma config:** remove karmaConfig, karmaConfigFile and project config keys ([#1388](https://github.com/stryker-mutator/stryker/issues/1388)) ([dc9be57](https://github.com/stryker-mutator/stryker/commit/dc9be57))
- **rename:** rename `stryker-xxx-xxx` -> `[@stryker-mutator](https://github.com/stryker-mutator)/xxx-xxx` ([1bbd6ff](https://github.com/stryker-mutator/stryker/commit/1bbd6ff))

### BREAKING CHANGES

- **rename:** The core package and plugins have been renamed: stryker-karma-runner -> @stryker-mutator/karma-runner
- **karma config:** Remove the `project` config key. Please use `projectType`. Remove the karmaConfig and karmaConfigKey config keys. Please use the `karma: { }` config key.

## [0.24.1](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.24.0...stryker-karma-runner@0.24.1) (2019-02-12)

**Note:** Version bump only for package stryker-karma-runner

# [0.24.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.23.0...stryker-karma-runner@0.24.0) (2019-02-08)

### Features

- **dependency injection:** Add dependency injection for plugins ([#1313](https://github.io/stryker-mutator/stryker/issues/1313)) ([f90cd56](https://github.io/stryker-mutator/stryker/commit/f90cd56)), closes [#667](https://github.io/stryker-mutator/stryker/issues/667)
- **port:** Deprecate property 'port' ([#1309](https://github.io/stryker-mutator/stryker/issues/1309)) ([2539ee0](https://github.io/stryker-mutator/stryker/commit/2539ee0))
- **test-runner:** Use new plugin system to load TestRunner plugins ([#1361](https://github.io/stryker-mutator/stryker/issues/1361)) ([266247b](https://github.io/stryker-mutator/stryker/commit/266247b))

<a name="0.23.0"></a>

# [0.23.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.22.0...stryker-karma-runner@0.23.0) (2018-12-23)

### Features

- **stryker-api:** Support stryker-api 0.23 ([#1293](https://github.io/stryker-mutator/stryker/issues/1293)) ([10720ad](https://github.io/stryker-mutator/stryker/commit/10720ad))

<a name="0.22.0"></a>

# [0.22.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.21.1...stryker-karma-runner@0.22.0) (2018-12-12)

### Features

- **karma-runner:** Configurable ng test arguments ([#1273](https://github.io/stryker-mutator/stryker/issues/1273)) ([4af3101](https://github.io/stryker-mutator/stryker/commit/4af3101))

<a name="0.21.1"></a>

## [0.21.1](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.21.0...stryker-karma-runner@0.21.1) (2018-11-29)

### Bug Fixes

- **stryker-api:** Update stryker-api peer dependency version ([677fc28](https://github.io/stryker-mutator/stryker/commit/677fc28))

<a name="0.21.0"></a>

# [0.21.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.20.3...stryker-karma-runner@0.21.0) (2018-11-29)

### Features

- **karma-runner:** Support automatic port selection ([#1239](https://github.io/stryker-mutator/stryker/issues/1239)) ([949333a](https://github.io/stryker-mutator/stryker/commit/949333a))

<a name="0.20.3"></a>

## [0.20.3](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.20.2...stryker-karma-runner@0.20.3) (2018-11-21)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.20.2"></a>

## [0.20.2](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.20.1...stryker-karma-runner@0.20.2) (2018-11-13)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.20.1"></a>

## [0.20.1](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.20.0...stryker-karma-runner@0.20.1) (2018-11-07)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.20.0"></a>

# [0.20.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.18.3...stryker-karma-runner@0.20.0) (2018-10-15)

### Bug Fixes

- **version:** Version bump for failed release ([8cf9e87](https://github.io/stryker-mutator/stryker/commit/8cf9e87))

### Features

- **karma-runner:** Support angular public api ([#1179](https://github.io/stryker-mutator/stryker/issues/1179)) ([b067a7f](https://github.io/stryker-mutator/stryker/commit/b067a7f))

<a name="0.18.3"></a>

## [0.18.3](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.18.2...stryker-karma-runner@0.18.3) (2018-10-03)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.18.2"></a>

## [0.18.2](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.18.1...stryker-karma-runner@0.18.2) (2018-09-30)

### Bug Fixes

- **karma-runner:** improve error message ([#1145](https://github.io/stryker-mutator/stryker/issues/1145)) ([2e56d38](https://github.io/stryker-mutator/stryker/commit/2e56d38))

<a name="0.18.1"></a>

## [0.18.1](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.18.0...stryker-karma-runner@0.18.1) (2018-09-14)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.18.0"></a>

# [0.18.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.17.1...stryker-karma-runner@0.18.0) (2018-08-28)

### Bug Fixes

- **karma-conf:** log importing the Karma config using debug instead of info ([#1089](https://github.io/stryker-mutator/stryker/issues/1089)) ([bca5dbd](https://github.io/stryker-mutator/stryker/commit/bca5dbd))

### Features

- **config:** rename config setting `project` to `projectType` and 'default' to 'custom' ([#1107](https://github.io/stryker-mutator/stryker/issues/1107)) ([4f4a9aa](https://github.io/stryker-mutator/stryker/commit/4f4a9aa))

<a name="0.17.1"></a>

## [0.17.1](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.17.0...stryker-karma-runner@0.17.1) (2018-08-21)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.17.0"></a>

# [0.17.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.16.5...stryker-karma-runner@0.17.0) (2018-08-19)

### Features

- **stryker config:** rename config setting `reporter` to `reporters` ([#1088](https://github.io/stryker-mutator/stryker/issues/1088)) ([584218a](https://github.io/stryker-mutator/stryker/commit/584218a)), closes [#793](https://github.io/stryker-mutator/stryker/issues/793)

<a name="0.16.5"></a>

## [0.16.5](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.16.4...stryker-karma-runner@0.16.5) (2018-08-17)

### Bug Fixes

- **dependencies:** support stryker-api 0.19.0 ([#1087](https://github.io/stryker-mutator/stryker/issues/1087)) ([44ce923](https://github.io/stryker-mutator/stryker/commit/44ce923))

<a name="0.16.4"></a>

## [0.16.4](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.16.3...stryker-karma-runner@0.16.4) (2018-08-17)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.16.3"></a>

## [0.16.3](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.16.2...stryker-karma-runner@0.16.3) (2018-08-16)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.16.2"></a>

## [0.16.2](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.16.1...stryker-karma-runner@0.16.2) (2018-08-03)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.16.1"></a>

## [0.16.1](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.16.0...stryker-karma-runner@0.16.1) (2018-07-23)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.16.0"></a>

# [0.16.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.15.3...stryker-karma-runner@0.16.0) (2018-07-20)

### Bug Fixes

- **Dependencies:** Pin all deps on minor version ([#974](https://github.io/stryker-mutator/stryker/issues/974)) ([f0a7e5a](https://github.io/stryker-mutator/stryker/commit/f0a7e5a)), closes [#954](https://github.io/stryker-mutator/stryker/issues/954) [#967](https://github.io/stryker-mutator/stryker/issues/967)

### Features

- **karma-runner:** add angular-cli support ([818fbed](https://github.io/stryker-mutator/stryker/commit/818fbed))
- **logging:** Allow log to a file ([#954](https://github.io/stryker-mutator/stryker/issues/954)) ([c2f6b82](https://github.io/stryker-mutator/stryker/commit/c2f6b82)), closes [#748](https://github.io/stryker-mutator/stryker/issues/748)

<a name="0.15.3"></a>

## [0.15.3](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.15.2...stryker-karma-runner@0.15.3) (2018-07-04)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.15.2"></a>

## [0.15.2](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.15.1...stryker-karma-runner@0.15.2) (2018-05-31)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.15.1"></a>

## [0.15.1](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.15.0...stryker-karma-runner@0.15.1) (2018-05-21)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.15.0"></a>

# [0.15.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.14.4...stryker-karma-runner@0.15.0) (2018-04-30)

### Features

- **node version:** drop node 4 support ([#724](https://github.io/stryker-mutator/stryker/issues/724)) ([a038931](https://github.io/stryker-mutator/stryker/commit/a038931))

### BREAKING CHANGES

- **node version:** Node 4 is no longer supported.

<a name="0.14.4"></a>

## [0.14.4](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.14.3...stryker-karma-runner@0.14.4) (2018-04-20)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.14.3"></a>

## [0.14.3](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.14.2...stryker-karma-runner@0.14.3) (2018-04-12)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.14.2"></a>

## [0.14.2](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.14.1...stryker-karma-runner@0.14.2) (2018-04-11)

### Bug Fixes

- Support stryker-api 0.16.0 ([#691](https://github.io/stryker-mutator/stryker/issues/691)) ([b2b019d](https://github.io/stryker-mutator/stryker/commit/b2b019d))

<a name="0.14.1"></a>

## [0.14.1](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.14.0...stryker-karma-runner@0.14.1) (2018-04-06)

### Bug Fixes

- **Plugins:** don't override default karma plugins ('karma-\*') ([#680](https://github.io/stryker-mutator/stryker/issues/680)) ([0c97842](https://github.io/stryker-mutator/stryker/commit/0c97842)), closes [#679](https://github.io/stryker-mutator/stryker/issues/679)

<a name="0.14.0"></a>

# [0.14.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.13.0...stryker-karma-runner@0.14.0) (2018-04-06)

### Features

- **Complex karma config:** allow complex karma config ([51263d3](https://github.io/stryker-mutator/stryker/commit/51263d3))

<a name="0.13.0"></a>

# [0.13.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.12.5...stryker-karma-runner@0.13.0) (2018-04-04)

### Features

- **karma-runner:** configure files with karma ([592c365](https://github.io/stryker-mutator/stryker/commit/592c365))

### BREAKING CHANGES

- **karma-runner:** If you used karma to configure your stryker files, that functionality
  has been removed. Please remove your `files` config property
  from stryker.conf.js entirely and let the new git integration
  do it's work.

<a name="0.12.5"></a>

## [0.12.5](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.12.4...stryker-karma-runner@0.12.5) (2018-03-22)

### Bug Fixes

- **peerDependency:** update stryker-api requirement to ^0.14.0 ([3ce04d4](https://github.io/stryker-mutator/stryker/commit/3ce04d4))

<a name="0.12.4"></a>

## [0.12.4](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.12.3...stryker-karma-runner@0.12.4) (2018-03-22)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.12.3"></a>

## [0.12.3](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.12.2...stryker-karma-runner@0.12.3) (2018-03-21)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.12.2"></a>

## [0.12.2](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.12.1...stryker-karma-runner@0.12.2) (2018-02-07)

### Bug Fixes

- **dependencies:** update stryker-api requirement to ^0.13.0 ([8eba6d4](https://github.io/stryker-mutator/stryker/commit/8eba6d4))

<a name="0.12.1"></a>

## [0.12.1](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.12.0...stryker-karma-runner@0.12.1) (2018-02-07)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.12.0"></a>

# [0.12.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.11.3...stryker-karma-runner@0.12.0) (2018-01-10)

### Features

- **karma-runner:** Support Karma ^2.0 ([#558](https://github.io/stryker-mutator/stryker/issues/558)) ([cc80ef2](https://github.io/stryker-mutator/stryker/commit/cc80ef2))

<a name="0.11.3"></a>

## [0.11.3](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.11.2...stryker-karma-runner@0.11.3) (2017-12-21)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.11.2"></a>

## [0.11.2](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.11.1...stryker-karma-runner@0.11.2) (2017-11-27)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.11.1"></a>

## [0.11.1](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.11.0...stryker-karma-runner@0.11.1) (2017-11-14)

### Bug Fixes

- **init stryker typescript:** Add init section ([#459](https://github.io/stryker-mutator/stryker/issues/459)) ([c4510d5](https://github.io/stryker-mutator/stryker/commit/c4510d5)), closes [#454](https://github.io/stryker-mutator/stryker/issues/454)

<a name="0.11.0"></a>

# [0.11.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.10.0...stryker-karma-runner@0.11.0) (2017-11-13)

### Features

- **karma:** Ability to override options ([#448](https://github.io/stryker-mutator/stryker/issues/448)) ([ee5d008](https://github.io/stryker-mutator/stryker/commit/ee5d008)), closes [#434](https://github.io/stryker-mutator/stryker/issues/434)

<a name="0.10.0"></a>

# [0.10.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.9.1...stryker-karma-runner@0.10.0) (2017-11-13)

### Features

- **mocha 4:** Add support for mocha version 4 ([#455](https://github.io/stryker-mutator/stryker/issues/455)) ([de6ae4f](https://github.io/stryker-mutator/stryker/commit/de6ae4f))

<a name="0.9.1"></a>

## [0.9.1](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.9.0...stryker-karma-runner@0.9.1) (2017-10-24)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.9.0"></a>

## [0.9.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.8.0...stryker-karma-runner@0.9.0) (2017-10-20)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.8.0"></a>

# [0.8.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.7.1...stryker-karma-runner@0.8.0) (2017-09-19)

### Features

- **typescript:** Add support for TypeScript mutation testing (#376) ([ba78168](https://github.io/stryker-mutator/stryker/commit/ba78168))

### BREAKING CHANGES

- **typescript:** \* Hoist the `Mutator` interface to a higher abstraction. With this interface it was possible to add mutators for specific ES5 AST nodes. As we're moving away from ES5, this plugin abstraction had to be hoisted to a higher level. It is no longer possible to plugin a specific ES5 node mutator.
- Update `report` interface: Rename `MutantState.Error` => `MutantState.RuntimeError`.

<a name="0.7.1"></a>

## [0.7.1](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.7.0...stryker-karma-runner@0.7.1) (2017-09-03)

**Note:** Version bump only for package stryker-karma-runner

<a name="0.7.0"></a>

# [0.7.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.6.0...stryker-karma-runner@0.7.0) (2017-08-25)

### Code Refactoring

- change ConfigWriter interface name to ConfigEditor (#357) ([ec4ae03](https://github.io/stryker-mutator/stryker/commit/ec4ae03))

### BREAKING CHANGES

- Public api for `ConfigWriter` is renamed to `ConfigEditor`. The corresponding `write` method is renamed to `edit`. If you're using custom `ConfigWriter` plugins you should rename the `write` method to `edit`. Please update the `stryker-mocha-framework` and `stryker-karma-runner` to the latest versions as they provide the new `ConfigEditor` plugin.

<a name="0.6.0"></a>

# [0.6.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.5.0...stryker-karma-runner@0.6.0) (2017-08-11)

### Features

- **ci-integration:** Configurable thresholds based on mutation score (#355) ([93f28cc](https://github.io/stryker-mutator/stryker/commit/93f28cc)), closes [#220](https://github.io/stryker-mutator/stryker/issues/220)

<a name="0.5.0"></a>

## [0.5.0](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.4.5...stryker-karma-runner@0.5.0) (2017-08-04)

<a name="0.4.5"></a>

## [0.4.5](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.4.4...stryker-karma-runner@0.4.5) (2017-07-14)

### Bug Fixes

- **ts-2.4:** Fix type issues for typescript 2.4 (#337) ([c18079b](https://github.io/stryker-mutator/stryker/commit/c18079b)), closes [#337](https://github.io/stryker-mutator/stryker/issues/337)

<a name="0.4.4"></a>

## [0.4.4](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.4.3...stryker-karma-runner@0.4.4) (2017-06-16)

### Bug Fixes

- **npmignore:** Align npm ignores (#321) ([db2a56e](https://github.io/stryker-mutator/stryker/commit/db2a56e))

<a name="0.4.2"></a>

## [0.4.2](https://github.io/stryker-mutator/stryker/compare/stryker-karma-runner@0.4.1...stryker-karma-runner@0.4.2) (2017-06-08)

<a name="0.4.1"></a>

## 0.4.1 (2017-06-02)

<a name="0.4.0"></a>

# 0.4.0 (2017-04-21)

### Bug Fixes

- **deps:** Add support for karma ^1.1.1 ([149ecd2](https://github.io/stryker-mutator/stryker/commit/149ecd2))
- **deps:** Update stryker-api version ([07ab5b0](https://github.io/stryker-mutator/stryker/commit/07ab5b0))
- **deps:** Update stryker-api version ([0207787](https://github.io/stryker-mutator/stryker/commit/0207787))
- **README:** Use lerna project structure ([fc15678](https://github.io/stryker-mutator/stryker/commit/fc15678))
- **TestRunner:** Remove stopper (#16) ([e65d6ab](https://github.io/stryker-mutator/stryker/commit/e65d6ab))

### Features

- **es2015-promise:** Remove dep to es6-promise (#9) ([d5ad84b](https://github.io/stryker-mutator/stryker/commit/d5ad84b))
- **KarmaTestRunner:** Force cwd as basePath (#18) ([205a393](https://github.io/stryker-mutator/stryker/commit/205a393))
- **life-cycle:** Add init lifecycle event. ([51a756f](https://github.io/stryker-mutator/stryker/commit/51a756f))
- **lifetime-support:** Drop Node 0.12 support (#14) ([aa85cd7](https://github.io/stryker-mutator/stryker/commit/aa85cd7))
- **one-pass-coverage:** Enable one pass coverage (#6) ([3c9e6e1](https://github.io/stryker-mutator/stryker/commit/3c9e6e1))
- **package.json:** Upgrade to TypeScript 2.1 (#13) ([456e6aa](https://github.io/stryker-mutator/stryker/commit/456e6aa))
- **read-karma-config:** Use karma configuration (#10) ([93e26f5](https://github.io/stryker-mutator/stryker/commit/93e26f5))
- **stop-karma:** Stop karma on dispose (#11) ([aab66a2](https://github.io/stryker-mutator/stryker/commit/aab66a2))
- **test-runner:** Allow for big coverage objects ([dff523e](https://github.io/stryker-mutator/stryker/commit/dff523e))
- **testFramework:** Use test framework (#3) ([eb7cb13](https://github.io/stryker-mutator/stryker/commit/eb7cb13))
- **ts2.0:** Migrate to typescript 2.0 (#5) ([d344bce](https://github.io/stryker-mutator/stryker/commit/d344bce))
- **unincluded-files:** Unincluded files support ([302ce73](https://github.io/stryker-mutator/stryker/commit/302ce73))

<a name="0.3.5"></a>

## [0.3.5](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.3.4...v0.3.5) (2017-03-01)

### Features

- **KarmaTestRunner:** Force cwd as basePath (#18) ([5df1090](https://github.io/stryker-mutator/stryker-karma-runner/commit/5df1090))

<a name="0.3.4"></a>

## [0.3.4](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.3.3...v0.3.4) (2017-01-29)

### Bug Fixes

- **TestRunner:** Remove stopper (#16) ([f2f9e78](https://github.io/stryker-mutator/stryker-karma-runner/commit/f2f9e78))

<a name="0.3.3"></a>

## [0.3.3](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.3.2...v0.3.3) (2016-12-30)

### Features

- **lifetime-support:** Drop Node 0.12 support (#14) ([16724af](https://github.io/stryker-mutator/stryker-karma-runner/commit/16724af))
- **package.json:** Upgrade to TypeScript 2.1 (#13) ([31a291f](https://github.io/stryker-mutator/stryker-karma-runner/commit/31a291f))
- **read-karma-config:** Use karma configuration (#10) ([d466abb](https://github.io/stryker-mutator/stryker-karma-runner/commit/d466abb))
- **stop-karma:** Stop karma on dispose (#11) ([05545eb](https://github.io/stryker-mutator/stryker-karma-runner/commit/05545eb))

<a name="0.3.2"></a>

## [0.3.2](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.3.1...v0.3.2) (2016-12-14)

### Features

- **es2015-promise:** Remove dep to es6-promise (#9) ([c64ed08](https://github.io/stryker-mutator/stryker-karma-runner/commit/c64ed08))

<a name="0.3.1"></a>

## [0.3.1](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.2.2...v0.3.1) (2016-11-20)

### Features

- **one-pass-coverage:** Enable one pass coverage (#6) ([6a9fa98](https://github.io/stryker-mutator/stryker-karma-runner/commit/6a9fa98))
- **test-runner:** Allow for big coverage objects ([661c46b](https://github.io/stryker-mutator/stryker-karma-runner/commit/661c46b))

<a name="0.2.2"></a>

## [0.2.2](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.2.1...v0.2.2) (2016-10-03)

### Bug Fixes

- **deps:** Update stryker-api version ([559c77c](https://github.io/stryker-mutator/stryker-karma-runner/commit/559c77c))

### Features

- **ts2.0:** Migrate to typescript 2.0 (#5) ([8f206bd](https://github.io/stryker-mutator/stryker-karma-runner/commit/8f206bd))

<a name="0.2.1"></a>

## [0.2.1](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.2.0...v0.2.1) (2016-08-30)

### Features

- **testFramework:** Use test framework (#3) ([9c7a750](https://github.io/stryker-mutator/stryker-karma-runner/commit/9c7a750))

<a name="0.2.0"></a>

# [0.2.0](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.1.0...v0.2.0) (2016-07-21)

### Bug Fixes

- **deps:** Add support for karma ^1.1.1 ([3e46c22](https://github.io/stryker-mutator/stryker-karma-runner/commit/3e46c22))

### Features

- **life-cycle:** Add init lifecycle event. ([985739d](https://github.io/stryker-mutator/stryker-karma-runner/commit/985739d))
- **unincluded-files:** Unincluded files support ([ef80460](https://github.io/stryker-mutator/stryker-karma-runner/commit/ef80460))

<a name="0.1.0"></a>

# [0.1.0](https://github.io/stryker-mutator/stryker-karma-runner/compare/v0.0.1...v0.1.0) (2016-07-01)

### Bug Fixes

- **deps:** Update stryker-api version ([ceb60e6](https://github.io/stryker-mutator/stryker-karma-runner/commit/ceb60e6))

<a name="0.0.1"></a>

## 0.0.1 (2016-06-29)
