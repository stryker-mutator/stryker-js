# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [8.0.0](https://github.com/stryker-mutator/stryker-js/compare/v7.3.0...v8.0.0) (2023-11-30)

### Bug Fixes

- **jest-runner:** support `handleTestEvent` class property ([#4623](https://github.com/stryker-mutator/stryker-js/issues/4623)) ([23f557d](https://github.com/stryker-mutator/stryker-js/commit/23f557d824f03a532e4e2d065710663eab2cda2f))

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

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [7.0.2](https://github.com/stryker-mutator/stryker-js/compare/v7.0.1...v7.0.2) (2023-06-08)

**Note:** Version bump only for package @stryker-mutator/jest-runner

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

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [6.4.1](https://github.com/stryker-mutator/stryker-js/compare/v6.4.0...v6.4.1) (2023-02-17)

### Bug Fixes

- **deps:** set correct stryker peer dep version ([c88c537](https://github.com/stryker-mutator/stryker-js/commit/c88c537c61d03e50362e98e9dddc7569b0c88200))

# [6.4.0](https://github.com/stryker-mutator/stryker-js/compare/v6.3.1...v6.4.0) (2023-02-17)

### Bug Fixes

- **deps:** update dependency tslib to ~2.5.0 ([#3952](https://github.com/stryker-mutator/stryker-js/issues/3952)) ([7548287](https://github.com/stryker-mutator/stryker-js/commit/7548287ee000bc09f88e6f1f0848e6e8e625bbb5))

## [6.3.1](https://github.com/stryker-mutator/stryker-js/compare/v6.3.0...v6.3.1) (2022-12-18)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [6.3.0](https://github.com/stryker-mutator/stryker-js/compare/v6.2.3...v6.3.0) (2022-10-30)

### Bug Fixes

- **jest-runner:** automatically set `NODE_ENV` env variable ([#3816](https://github.com/stryker-mutator/stryker-js/issues/3816)) ([9fc7a6f](https://github.com/stryker-mutator/stryker-js/commit/9fc7a6f64b27cdb67e6844ce00f6e55c630d0cd6))
- **jest:** support more config file formats ([#3761](https://github.com/stryker-mutator/stryker-js/issues/3761)) ([7d42139](https://github.com/stryker-mutator/stryker-js/commit/7d421394fcdaab6222cc6e55662e94a3abe94e79))

### Features

- **ci:** forbid `.only` in CI pipeline tests ([#3823](https://github.com/stryker-mutator/stryker-js/issues/3823)) ([051ec93](https://github.com/stryker-mutator/stryker-js/commit/051ec937809468751a74c9e01cacd27ceb1acca2))

## [6.2.3](https://github.com/stryker-mutator/stryker-js/compare/v6.2.2...v6.2.3) (2022-10-10)

### Bug Fixes

- **jest:** support multiple jest installations ([#3781](https://github.com/stryker-mutator/stryker-js/issues/3781)) ([9f10e20](https://github.com/stryker-mutator/stryker-js/commit/9f10e20e95e6a0d0b22ba7b4f4df2c1e9ca79a56))

## [6.2.2](https://github.com/stryker-mutator/stryker-js/compare/v6.2.1...v6.2.2) (2022-09-06)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [6.2.1](https://github.com/stryker-mutator/stryker-js/compare/v6.2.0...v6.2.1) (2022-09-06)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [6.2.0](https://github.com/stryker-mutator/stryker-js/compare/v6.1.2...v6.2.0) (2022-09-06)

### Features

- **incremental:** add incremental mode ([#3609](https://github.com/stryker-mutator/stryker-js/issues/3609)) ([82bea56](https://github.com/stryker-mutator/stryker-js/commit/82bea5604c81c1ccf76d44827ad3922cfb61463b))

# [6.2.0-beta.0](https://github.com/stryker-mutator/stryker-js/compare/v6.1.2...v6.2.0-beta.0) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [6.1.2](https://github.com/stryker-mutator/stryker-js/compare/v6.1.1...v6.1.2) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [6.1.1](https://github.com/stryker-mutator/stryker-js/compare/v6.1.0...v6.1.1) (2022-06-28)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [6.1.0](https://github.com/stryker-mutator/stryker-js/compare/v6.0.2...v6.1.0) (2022-06-27)

### Bug Fixes

- **jest:** allow mixin jest env for unit testing ([#3598](https://github.com/stryker-mutator/stryker-js/issues/3598)) ([da8a720](https://github.com/stryker-mutator/stryker-js/commit/da8a7206243f148030bf7421d236fd5b3be87b89))

## [6.0.2](https://github.com/stryker-mutator/stryker-js/compare/v6.0.1...v6.0.2) (2022-05-05)

### Bug Fixes

- **jest-runner:** support jest@28 ([#3501](https://github.com/stryker-mutator/stryker-js/issues/3501)) ([f312ad6](https://github.com/stryker-mutator/stryker-js/commit/f312ad6aee555f34f45b07de9d5ea8e7b253779c))

## [6.0.1](https://github.com/stryker-mutator/stryker-js/compare/v6.0.0...v6.0.1) (2022-05-04)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [6.0.0](https://github.com/stryker-mutator/stryker-js/compare/v6.0.0-beta.0...v6.0.0) (2022-05-03)

### chore

- **node:** drop support for Node 12 ([10d874e](https://github.com/stryker-mutator/stryker-js/commit/10d874e4c46335d9ea457634d3061af35fa8f854))

### Features

- **react:** support react 18 projects by default ([#3491](https://github.com/stryker-mutator/stryker-js/issues/3491)) ([82d9bce](https://github.com/stryker-mutator/stryker-js/commit/82d9bce0f351ce8b0c852684665bcec129846ee3))

### BREAKING CHANGES

- **node:** Drop support for Node 12. Minimal version is now Node 14.18.0.

# [6.0.0-beta.0](https://github.com/stryker-mutator/stryker-js/compare/v5.6.1...v6.0.0-beta.0) (2022-03-02)

### Bug Fixes

- **jest:** hit limit spread over multiple files ([#3446](https://github.com/stryker-mutator/stryker-js/issues/3446)) ([51308f4](https://github.com/stryker-mutator/stryker-js/commit/51308f4f071693b19dd0f335a107c6ffa87ce309))

### Features

- **esm config:** support config file as pure esm ([#3432](https://github.com/stryker-mutator/stryker-js/issues/3432)) ([309a7e2](https://github.com/stryker-mutator/stryker-js/commit/309a7e2807e454a82f177de781bc4908f87c739b))
- **esm:** migrate StrykerJS to pure ESM ([#3409](https://github.com/stryker-mutator/stryker-js/issues/3409)) ([78c305e](https://github.com/stryker-mutator/stryker-js/commit/78c305e2c2271fedb54bfff3d34aa6b70b421b3a))
- **hit limit:** infinite loop prevention in jest-runner ([#3439](https://github.com/stryker-mutator/stryker-js/issues/3439)) ([5fecd52](https://github.com/stryker-mutator/stryker-js/commit/5fecd520abd1826ee4c8296d7f1bbee197a300dc))
- **reload test environment:** implement test environment reload ([#3369](https://github.com/stryker-mutator/stryker-js/issues/3369)) ([b95b907](https://github.com/stryker-mutator/stryker-js/commit/b95b907e54d3a114731a8bcf659a1910df4e4f0b))
- **test runner api:** `killedBy` is always an array ([#3187](https://github.com/stryker-mutator/stryker-js/issues/3187)) ([c257966](https://github.com/stryker-mutator/stryker-js/commit/c257966e6c7726e180e072c8ae7f3fd011485c05))

### BREAKING CHANGES

- **esm config:** Exporting a function (using `module.exports = function(config) {}`) from your `stryker.conf.js` file is no longer supported. This was already deprecated but now will give an error.
- **esm:** StrykerJS is now a pure ESM. Please [read this](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
- **esm:** Node 12.20 is now the min version.
- **esm:** Karma v6.3 is now the min supported karma version for `@stryker-mutator/karma-runner`, since [that version added support for async config loading](https://github.com/karma-runner/karma/blob/master/CHANGELOG.md#630-2021-03-23)
- **reload test environment:** Test runner plugins must provide `TestRunnerCapabilities` by implementing the `capabilities` method.

## [5.6.1](https://github.com/stryker-mutator/stryker-js/compare/v5.6.0...v5.6.1) (2022-01-23)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [5.6.0](https://github.com/stryker-mutator/stryker-js/compare/v5.5.1...v5.6.0) (2022-01-09)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [5.5.1](https://github.com/stryker-mutator/stryker-js/compare/v5.5.0...v5.5.1) (2021-12-02)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [5.5.0](https://github.com/stryker-mutator/stryker-js/compare/v5.4.1...v5.5.0) (2021-11-23)

### Features

- **jest-runner:** support `--findRelatedTests` in dry run ([#3234](https://github.com/stryker-mutator/stryker-js/issues/3234)) ([b2e4584](https://github.com/stryker-mutator/stryker-js/commit/b2e458432483353dd0ea0471b623326ff58c92bc))

## [5.4.1](https://github.com/stryker-mutator/stryker-js/compare/v5.4.0...v5.4.1) (2021-09-30)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [5.4.0](https://github.com/stryker-mutator/stryker-js/compare/v5.3.0...v5.4.0) (2021-09-01)

### Features

- **test runner:** Support for disable bail ([#3074](https://github.com/stryker-mutator/stryker-js/issues/3074)) ([0962232](https://github.com/stryker-mutator/stryker-js/commit/0962232fe2a181a2fde0067ed95f99885b8cee28))

# [5.3.0](https://github.com/stryker-mutator/stryker-js/compare/v5.2.3...v5.3.0) (2021-08-07)

### Bug Fixes

- **jest-runner:** load .env for create-react-app ([#3055](https://github.com/stryker-mutator/stryker-js/issues/3055)) ([12e1324](https://github.com/stryker-mutator/stryker-js/commit/12e132410637a9bc4724c4b1fd43acd70f841ce3))

### Features

- **hit limit:** infinite loop prevention in karma-runner ([#3031](https://github.com/stryker-mutator/stryker-js/issues/3031)) ([fc732fc](https://github.com/stryker-mutator/stryker-js/commit/fc732fce8838c96be2fdf37aff69b12c996d7cb0))

## [5.2.3](https://github.com/stryker-mutator/stryker-js/compare/v5.2.2...v5.2.3) (2021-08-01)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [5.2.2](https://github.com/stryker-mutator/stryker-js/compare/v5.2.1...v5.2.2) (2021-07-13)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [5.2.1](https://github.com/stryker-mutator/stryker-js/compare/v5.2.0...v5.2.1) (2021-07-02)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [5.2.0](https://github.com/stryker-mutator/stryker-js/compare/v5.1.1...v5.2.0) (2021-07-02)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [5.1.1](https://github.com/stryker-mutator/stryker-js/compare/v5.1.0...v5.1.1) (2021-06-15)

### Bug Fixes

- **peerDeps:** update peer dependencies ([05733d2](https://github.com/stryker-mutator/stryker-js/commit/05733d260d5ffc9eb1b3e284bdc4bc8adafc4d38))

# [5.1.0](https://github.com/stryker-mutator/stryker-js/compare/v5.0.1...v5.1.0) (2021-06-14)

### Bug Fixes

- **jest-runner:** allow a different rootDir ([b66a617](https://github.com/stryker-mutator/stryker-js/commit/b66a61711a8bea554e29efb8848fa4c9d0afb34c))
- **jest-runner:** use local jest version when jest@<25 ([#2950](https://github.com/stryker-mutator/stryker-js/issues/2950)) ([3218c9e](https://github.com/stryker-mutator/stryker-js/commit/3218c9e57a641866f9b13028c9239af39e7c60a7))

### Features

- **jest-runner:** allow configuration in a custom package.json ([825548c](https://github.com/stryker-mutator/stryker-js/commit/825548c66956ff34c500caadb1ebc2030ef59df3))
- **jest-runner:** dynamically override "testEnvironment" ([#2934](https://github.com/stryker-mutator/stryker-js/issues/2934)) ([0590869](https://github.com/stryker-mutator/stryker-js/commit/05908690cd5fb5c70ff032c6a985bb57bcebb301))
- **jest-runner:** support findRelatedTests for mutated files outside of roots ([#2951](https://github.com/stryker-mutator/stryker-js/issues/2951)) ([19dccec](https://github.com/stryker-mutator/stryker-js/commit/19dcceca950c7c92d08826a4958db73eca7e71dd))

## [5.0.1](https://github.com/stryker-mutator/stryker-js/compare/v5.0.0...v5.0.1) (2021-05-28)

### Bug Fixes

- **jest-runner:** Support Jest v27 ([#2861](https://github.com/stryker-mutator/stryker-js/issues/2861)) ([8d3560b](https://github.com/stryker-mutator/stryker-js/commit/8d3560bd2f1b8cbb4235b13dbef9afa84708ac73))

# [5.0.0](https://github.com/stryker-mutator/stryker-js/compare/v4.6.0...v5.0.0) (2021-05-14)

### Features

- **jest:** report test files and test positions ([#2808](https://github.com/stryker-mutator/stryker-js/issues/2808)) ([c19095e](https://github.com/stryker-mutator/stryker-js/commit/c19095e57f6a46d7d9c9b97f852747d4167ab256))
- **jest-runner:** drop projectType "create-react-app-ts" ([#2788](https://github.com/stryker-mutator/stryker-js/issues/2788)) ([2581e32](https://github.com/stryker-mutator/stryker-js/commit/2581e32435894f47f47ad79f50ca12c3368c6c13)), closes [#2787](https://github.com/stryker-mutator/stryker-js/issues/2787) [#2787](https://github.com/stryker-mutator/stryker-js/issues/2787)
- **node:** Drop support for node 10 ([#2879](https://github.com/stryker-mutator/stryker-js/issues/2879)) ([dd29f88](https://github.com/stryker-mutator/stryker-js/commit/dd29f883d384fd29b86a0ef9f78808975657a001))
- **options:** make "perTest" the default for "coverageAnalysis" ([#2881](https://github.com/stryker-mutator/stryker-js/issues/2881)) ([518ebe6](https://github.com/stryker-mutator/stryker-js/commit/518ebe6b946fc35138b636a015b569fe9a272ed0))
- **reporter api:** unify reporter api with mutation-testing-elements ([#2798](https://github.com/stryker-mutator/stryker-js/issues/2798)) ([d173b27](https://github.com/stryker-mutator/stryker-js/commit/d173b27117ade43e86a991643207532e338e7907)), closes [#2766](https://github.com/stryker-mutator/stryker-js/issues/2766)

### BREAKING CHANGES

- **options:** `"perTest"` is now the default value for "coverageAnalysis" when the configured test runner is not "command". Explicitly set `"coverageAnalysis": "off"` manually to opt-out of this behavior.
- **node:** Node 10 is no longer supported. Please use Node 12 or higher.
- **reporter api:** Changes to `Reporter` and `TestRunner` plugin API of Stryker
- **jest-runner:** Support for project type `create-react-app-ts` is dropped from the jest-runner.

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

### Bug Fixes

- **jest-runner:** support custom rootDir ([312f6fe](https://github.com/stryker-mutator/stryker/commit/312f6feb6350c6f4027854ab9847006f527fafd2))

# [4.4.0](https://github.com/stryker-mutator/stryker/compare/v4.3.1...v4.4.0) (2021-01-24)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [4.3.1](https://github.com/stryker-mutator/stryker/compare/v4.3.0...v4.3.1) (2020-12-25)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [4.3.0](https://github.com/stryker-mutator/stryker/compare/v4.2.0...v4.3.0) (2020-12-25)

### Features

- **jest-runner:** support coverage analysis ([#2634](https://github.com/stryker-mutator/stryker/issues/2634)) ([5662e58](https://github.com/stryker-mutator/stryker/commit/5662e581e03ed955d1c851c9d818f0ad4e0d18a8))

# [4.2.0](https://github.com/stryker-mutator/stryker/compare/v4.1.2...v4.2.0) (2020-12-09)

### Features

- **jest-runner:** resolve local jest version ([#2623](https://github.com/stryker-mutator/stryker/issues/2623)) ([1466f9a](https://github.com/stryker-mutator/stryker/commit/1466f9a988d11a4c43cd7c97f195b0eacb75c96f))

## [4.1.2](https://github.com/stryker-mutator/stryker/compare/v4.1.1...v4.1.2) (2020-11-06)

### Bug Fixes

- **peerDeps:** update core in peerDependencies ([045dbc3](https://github.com/stryker-mutator/stryker/commit/045dbc3742c123658f4cf9ab2786b20ffd89a8cf))

## [4.1.1](https://github.com/stryker-mutator/stryker/compare/v4.1.0...v4.1.1) (2020-11-05)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [4.1.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0...v4.1.0) (2020-10-30)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [4.0.0](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.10...v4.0.0) (2020-10-07)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [4.0.0-beta.10](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.9...v4.0.0-beta.10) (2020-10-05)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [4.0.0-beta.9](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.8...v4.0.0-beta.9) (2020-09-30)

### Features

- **jest-runner:** deprecate "create-react-app-ts" ([#2497](https://github.com/stryker-mutator/stryker/issues/2497)) ([0aacc7b](https://github.com/stryker-mutator/stryker/commit/0aacc7be5bb045887e96f0a8115b7e3e46e1a1ff))

# [4.0.0-beta.8](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.7...v4.0.0-beta.8) (2020-09-22)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [4.0.0-beta.7](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.6...v4.0.0-beta.7) (2020-09-17)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [4.0.0-beta.6](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.5...v4.0.0-beta.6) (2020-09-10)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [4.0.0-beta.5](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.4...v4.0.0-beta.5) (2020-09-09)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [4.0.0-beta.4](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.3...v4.0.0-beta.4) (2020-08-29)

### Features

- **api:** rename test_runner2 -> test_runner ([#2442](https://github.com/stryker-mutator/stryker/issues/2442)) ([4d3ae97](https://github.com/stryker-mutator/stryker/commit/4d3ae9764dbd689c895b76e44f2eea76c82fabc8))
- **jest-runner:** switch mutants using env ([#2416](https://github.com/stryker-mutator/stryker/issues/2416)) ([cad01ba](https://github.com/stryker-mutator/stryker/commit/cad01baf9f4fc3bab2ae5244627586133fb618be))

### BREAKING CHANGES

- **api:** Plugin creators should now use `'test_runner'` instead of `'test_runner2'`.

# [4.0.0-beta.3](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.2...v4.0.0-beta.3) (2020-08-19)

### Features

- **jest-runner:** remove deprecated project types ([#2361](https://github.com/stryker-mutator/stryker/issues/2361)) ([d0aa5c3](https://github.com/stryker-mutator/stryker/commit/d0aa5c3c2f676176d3fbceb24ab2cd17011c9ecf))
- **test runner api:** remove `sandboxFileNames` injectable values ([#2369](https://github.com/stryker-mutator/stryker/issues/2369)) ([92f3bf5](https://github.com/stryker-mutator/stryker/commit/92f3bf528d0b01be1f6c219b37a5f90da0431686)), closes [#2351](https://github.com/stryker-mutator/stryker/issues/2351)

### BREAKING CHANGES

- **jest-runner:** Project types `react` and `react-ts` has been removed. Please use `create-react-app` and `create-react-app-ts` respectively

# [4.0.0-beta.2](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.1...v4.0.0-beta.2) (2020-08-07)

### Features

- **jest-runner:** support mutation switching ([#2350](https://github.com/stryker-mutator/stryker/issues/2350)) ([9e6e6e0](https://github.com/stryker-mutator/stryker/commit/9e6e6e077731344ed0588d64b5c8ba2f19c8492e))

# [4.0.0-beta.1](https://github.com/stryker-mutator/stryker/compare/v4.0.0-beta.0...v4.0.0-beta.1) (2020-07-17)

### Bug Fixes

- **Jest:** Notify users of lacking Jest support ([#2322](https://github.com/stryker-mutator/stryker/issues/2322)) ([0bbc0c1](https://github.com/stryker-mutator/stryker/commit/0bbc0c119ba5d661ba9751d241ba548293738aa8))

# [4.0.0-beta.0](https://github.com/stryker-mutator/stryker/compare/v3.3.1...v4.0.0-beta.0) (2020-07-10)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [3.3.1](https://github.com/stryker-mutator/stryker/compare/v3.3.0...v3.3.1) (2020-07-04)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [3.3.0](https://github.com/stryker-mutator/stryker/compare/v3.2.4...v3.3.0) (2020-06-16)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [3.2.4](https://github.com/stryker-mutator/stryker/compare/v3.2.3...v3.2.4) (2020-05-18)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [3.2.3](https://github.com/stryker-mutator/stryker/compare/v3.2.2...v3.2.3) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [3.2.2](https://github.com/stryker-mutator/stryker/compare/v3.2.1...v3.2.2) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [3.2.1](https://github.com/stryker-mutator/stryker/compare/v3.2.0...v3.2.1) (2020-05-15)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [3.2.0](https://github.com/stryker-mutator/stryker/compare/v3.1.0...v3.2.0) (2020-05-13)

### Features

- **api:** Deprecated Config in favor of StrykerOptions ([dccdd91](https://github.com/stryker-mutator/stryker/commit/dccdd9119743d776e2dc4b572a9e02b1524ef88b))
- **Jest:** support overriding config ([#2197](https://github.com/stryker-mutator/stryker/issues/2197)) ([d37b7d7](https://github.com/stryker-mutator/stryker/commit/d37b7d724fea7a62d93613d9579defbfdffcd180)), closes [#2155](https://github.com/stryker-mutator/stryker/issues/2155)
- **validation:** add validation on plugin options ([#2158](https://github.com/stryker-mutator/stryker/issues/2158)) ([d78fe1e](https://github.com/stryker-mutator/stryker/commit/d78fe1e013ac2e309a29f0def3029492b1e6c1ea))

# [3.1.0](https://github.com/stryker-mutator/stryker/compare/v3.0.2...v3.1.0) (2020-03-29)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [3.0.2](https://github.com/stryker-mutator/stryker/compare/v3.0.1...v3.0.2) (2020-03-13)

### Bug Fixes

- **nodejs requirement:** set NodeJS requirement to at least Node 10 ([8c08059](https://github.com/stryker-mutator/stryker/commit/8c080594a87d638ea4349ee69e05ed6c7eba6463))

## [3.0.1](https://github.com/stryker-mutator/stryker/compare/v3.0.0...v3.0.1) (2020-03-12)

### Bug Fixes

- **Peer dependencies:** set peer dependencies for v3 ([#2096](https://github.com/stryker-mutator/stryker/issues/2096)) ([8648c4d](https://github.com/stryker-mutator/stryker/commit/8648c4d9c70ce032841371c6041ebb76bf099948)), closes [#2095](https://github.com/stryker-mutator/stryker/issues/2095)

# [3.0.0](https://github.com/stryker-mutator/stryker/compare/v2.5.0...v3.0.0) (2020-03-11)

### Features

- **Initializer:** Initialize config file as JSON by default ([#2093](https://github.com/stryker-mutator/stryker/issues/2093)) ([e07d953](https://github.com/stryker-mutator/stryker/commit/e07d9535084881180d5abf7b58bece1b65f2455f)), closes [#2000](https://github.com/stryker-mutator/stryker/issues/2000)
- **jest-runner:** support Jest 25 ([b45e872](https://github.com/stryker-mutator/stryker/commit/b45e8725fe19b3568e0d358d4a6add32bafed425)), closes [#1983](https://github.com/stryker-mutator/stryker/issues/1983)
- **react:** change react to create-react-app ([#1978](https://github.com/stryker-mutator/stryker/issues/1978)) ([7f34f28](https://github.com/stryker-mutator/stryker/commit/7f34f28dda821da561ae7ea5d041bb58fca4c011))

# [2.5.0](https://github.com/stryker-mutator/stryker/compare/v2.4.0...v2.5.0) (2020-01-12)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [2.4.0](https://github.com/stryker-mutator/stryker/compare/v2.3.0...v2.4.0) (2019-11-24)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [2.3.0](https://github.com/stryker-mutator/stryker/compare/v2.2.1...v2.3.0) (2019-11-13)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [2.2.1](https://github.com/stryker-mutator/stryker/compare/v2.2.0...v2.2.1) (2019-11-06)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [2.2.0](https://github.com/stryker-mutator/stryker/compare/v2.1.0...v2.2.0) (2019-11-06)

### Bug Fixes

- **jest-runner:** improve error message for missing react-scripts ([#1694](https://github.com/stryker-mutator/stryker/issues/1694)) ([313e3bf](https://github.com/stryker-mutator/stryker/commit/313e3bf))

# [2.1.0](https://github.com/stryker-mutator/stryker/compare/v2.0.2...v2.1.0) (2019-09-08)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [2.0.2](https://github.com/stryker-mutator/stryker/compare/v2.0.1...v2.0.2) (2019-07-11)

### Bug Fixes

- **dispose:** fix race condition in dispose action ([124ef6a](https://github.com/stryker-mutator/stryker/commit/124ef6a)), closes [#1542](https://github.com/stryker-mutator/stryker/issues/1542)

## [2.0.1](https://github.com/stryker-mutator/stryker/compare/v2.0.0...v2.0.1) (2019-07-02)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [2.0.0](https://github.com/stryker-mutator/stryker/compare/v1.3.1...v2.0.0) (2019-05-17)

### Features

- **node 6:** drop support for node 6 ([#1517](https://github.com/stryker-mutator/stryker/issues/1517)) ([801d7cd](https://github.com/stryker-mutator/stryker/commit/801d7cd))

### BREAKING CHANGES

- **node 6:** support for Node 6 has been dropped. Node 8 or higher is now required.

## [1.3.1](https://github.com/stryker-mutator/stryker/compare/v1.3.0...v1.3.1) (2019-04-26)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [1.3.0](https://github.com/stryker-mutator/stryker/compare/v1.2.0...v1.3.0) (2019-04-24)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [1.2.0](https://github.com/stryker-mutator/stryker/compare/v1.1.1...v1.2.0) (2019-04-02)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [1.1.1](https://github.com/stryker-mutator/stryker/compare/v1.1.0...v1.1.1) (2019-03-21)

**Note:** Version bump only for package @stryker-mutator/jest-runner

# [1.1.0](https://github.com/stryker-mutator/stryker/compare/v1.0.3...v1.1.0) (2019-03-04)

### Features

- **jest-runner:** disable notifications ([#1419](https://github.com/stryker-mutator/stryker/issues/1419)) ([948166b](https://github.com/stryker-mutator/stryker/commit/948166b))

## [1.0.3](https://github.com/stryker-mutator/stryker/compare/v1.0.2...v1.0.3) (2019-02-26)

### Bug Fixes

- **jest-runner:** mark 'todo' tests as skipped ([#1420](https://github.com/stryker-mutator/stryker/issues/1420)) ([26d813f](https://github.com/stryker-mutator/stryker/commit/26d813f))

## [1.0.2](https://github.com/stryker-mutator/stryker/compare/v1.0.1...v1.0.2) (2019-02-13)

### Bug Fixes

- **stryker init:** update metadata for `stryker init` command ([#1403](https://github.com/stryker-mutator/stryker/issues/1403)) ([38f269b](https://github.com/stryker-mutator/stryker/commit/38f269b)), closes [#1402](https://github.com/stryker-mutator/stryker/issues/1402)

## [1.0.1](https://github.com/stryker-mutator/stryker/compare/v1.0.0...v1.0.1) (2019-02-13)

**Note:** Version bump only for package @stryker-mutator/jest-runner

## [1.0.0](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.4.1...@stryker-mutator/jest-runner@1.0.0) (2019-02-13)

### Features

- **config injection:** remove Config from the DI tokens ([#1389](https://github.com/stryker-mutator/stryker/issues/1389)) ([857e4a5](https://github.com/stryker-mutator/stryker/commit/857e4a5))
- **jest project config:** remove deprecated project setting and 'default' project name ([#1375](https://github.com/stryker-mutator/stryker/issues/1375)) ([f0bd698](https://github.com/stryker-mutator/stryker/commit/f0bd698))
- **rename:** rename `stryker-xxx-xxx` -> `[@stryker-mutator](https://github.com/stryker-mutator)/xxx-xxx` ([1bbd6ff](https://github.com/stryker-mutator/stryker/commit/1bbd6ff))

### BREAKING CHANGES

- **rename:** The core package and plugins have been renamed: stryker-jest-runner -> @stryker-mutator/jest-runner
- **config injection:** Remove Config object from Dependency Injection (only relevant for plugin creators).

## [1.4.1](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.4.0...stryker-jest-runner@1.4.1) (2019-02-12)

**Note:** Version bump only for package stryker-jest-runner

# [1.4.0](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.3.0...stryker-jest-runner@1.4.0) (2019-02-08)

### Features

- **config-editors:** Remove side effects from all config editor plugins ([#1317](https://github.com/stryker-mutator/stryker/issues/1317)) ([1f61bed](https://github.com/stryker-mutator/stryker/commit/1f61bed))
- **mutators:** Remove side effects from mutator plugins ([#1352](https://github.com/stryker-mutator/stryker/issues/1352)) ([edaf401](https://github.com/stryker-mutator/stryker/commit/edaf401))
- **port:** Deprecate property 'port' ([#1309](https://github.com/stryker-mutator/stryker/issues/1309)) ([2539ee0](https://github.com/stryker-mutator/stryker/commit/2539ee0))
- **test-frameworks:** Remove side effects from all test-framework plugins ([#1319](https://github.com/stryker-mutator/stryker/issues/1319)) ([a7160f4](https://github.com/stryker-mutator/stryker/commit/a7160f4))
- **test-runner:** Use new plugin system to load TestRunner plugins ([#1361](https://github.com/stryker-mutator/stryker/issues/1361)) ([266247b](https://github.com/stryker-mutator/stryker/commit/266247b))
- **transpilers:** Remove side effects transpiler plugins ([#1351](https://github.com/stryker-mutator/stryker/issues/1351)) ([9a8b539](https://github.com/stryker-mutator/stryker/commit/9a8b539))

<a name="1.3.0"></a>

# [1.3.0](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.2.10...stryker-jest-runner@1.3.0) (2018-12-23)

### Features

- **stryker-api:** Support stryker-api 0.23 ([#1293](https://github.com/stryker-mutator/stryker/issues/1293)) ([10720ad](https://github.com/stryker-mutator/stryker/commit/10720ad))

<a name="1.2.10"></a>

## [1.2.10](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.2.9...stryker-jest-runner@1.2.10) (2018-12-12)

**Note:** Version bump only for package stryker-jest-runner

<a name="1.2.9"></a>

## [1.2.9](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.2.8...stryker-jest-runner@1.2.9) (2018-11-29)

### Bug Fixes

- **stryker-api:** Update stryker-api peer dependency version ([677fc28](https://github.com/stryker-mutator/stryker/commit/677fc28))

<a name="1.2.8"></a>

## [1.2.8](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.2.7...stryker-jest-runner@1.2.8) (2018-11-29)

### Bug Fixes

- **JestTestRunner:** run jest with --findRelatedTests ([#1235](https://github.com/stryker-mutator/stryker/issues/1235)) ([5e0790e](https://github.com/stryker-mutator/stryker/commit/5e0790e))

<a name="1.2.7"></a>

## [1.2.7](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.2.6...stryker-jest-runner@1.2.7) (2018-11-13)

**Note:** Version bump only for package stryker-jest-runner

<a name="1.2.6"></a>

## [1.2.6](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.2.5...stryker-jest-runner@1.2.6) (2018-11-07)

**Note:** Version bump only for package stryker-jest-runner

<a name="1.2.5"></a>

## [1.2.5](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.2.4...stryker-jest-runner@1.2.5) (2018-10-25)

**Note:** Version bump only for package stryker-jest-runner

<a name="1.2.4"></a>

## [1.2.4](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.2.2...stryker-jest-runner@1.2.4) (2018-10-15)

### Bug Fixes

- **any-promise:** Don't register a promise implementation ([#1180](https://github.com/stryker-mutator/stryker/issues/1180)) ([1d3e2f6](https://github.com/stryker-mutator/stryker/commit/1d3e2f6))
- **version:** Version bump for failed release ([8cf9e87](https://github.com/stryker-mutator/stryker/commit/8cf9e87))

<a name="1.2.2"></a>

## [1.2.2](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.2.1...stryker-jest-runner@1.2.2) (2018-10-03)

### Bug Fixes

- **JestTestRunner:** fix stryker error on skipping tests ([#1168](https://github.com/stryker-mutator/stryker/issues/1168)) ([1f87ab1](https://github.com/stryker-mutator/stryker/commit/1f87ab1)), closes [#1152](https://github.com/stryker-mutator/stryker/issues/1152)

<a name="1.2.1"></a>

## [1.2.1](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.2.0...stryker-jest-runner@1.2.1) (2018-09-14)

**Note:** Version bump only for package stryker-jest-runner

<a name="1.2.0"></a>

# [1.2.0](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.1.1...stryker-jest-runner@1.2.0) (2018-08-28)

### Features

- **config:** rename config setting `project` to `projectType` and 'default' to 'custom' ([#1107](https://github.com/stryker-mutator/stryker/issues/1107)) ([4f4a9aa](https://github.com/stryker-mutator/stryker/commit/4f4a9aa))

<a name="1.1.1"></a>

## [1.1.1](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.1.0...stryker-jest-runner@1.1.1) (2018-08-21)

**Note:** Version bump only for package stryker-jest-runner

<a name="1.1.0"></a>

# [1.1.0](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.0.4...stryker-jest-runner@1.1.0) (2018-08-19)

### Features

- **stryker config:** rename config setting `reporter` to `reporters` ([#1088](https://github.com/stryker-mutator/stryker/issues/1088)) ([584218a](https://github.com/stryker-mutator/stryker/commit/584218a)), closes [#793](https://github.com/stryker-mutator/stryker/issues/793)

<a name="1.0.4"></a>

## [1.0.4](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.0.3...stryker-jest-runner@1.0.4) (2018-08-17)

### Bug Fixes

- **dependencies:** support stryker-api 0.19.0 ([#1087](https://github.com/stryker-mutator/stryker/issues/1087)) ([44ce923](https://github.com/stryker-mutator/stryker/commit/44ce923))

<a name="1.0.3"></a>

## [1.0.3](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.0.2...stryker-jest-runner@1.0.3) (2018-08-17)

**Note:** Version bump only for package stryker-jest-runner

<a name="1.0.2"></a>

## [1.0.2](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.0.1...stryker-jest-runner@1.0.2) (2018-08-16)

**Note:** Version bump only for package stryker-jest-runner

<a name="1.0.1"></a>

## [1.0.1](https://github.com/stryker-mutator/stryker/compare/stryker-jest-runner@1.0.0...stryker-jest-runner@1.0.1) (2018-08-03)

### Bug Fixes

- **jest-runner:** Update peer dependency on Jest ([7e30994](https://github.com/stryker-mutator/stryker/commit/7e30994))

<a name="1.0.0"></a>

# 1.0.0 (2018-07-20)

### Bug Fixes

- **bail:** disable bail ([#36](https://github.com/stryker-mutator/stryker/issues/36)) ([d29e349](https://github.com/stryker-mutator/stryker/commit/d29e349))
- **configuration:** Allow more test file names ([0a7fff9](https://github.com/stryker-mutator/stryker/commit/0a7fff9))
- **configuration:** Remove test regex filter ([df7dc04](https://github.com/stryker-mutator/stryker/commit/df7dc04)), closes [#11](https://github.com/stryker-mutator/stryker/issues/11)
- **configuration:** Remove unnecessary options ([fc2799d](https://github.com/stryker-mutator/stryker/commit/fc2799d)), closes [facebook/jest#2776](https://github.com/facebook/jest/issues/2776)
- **configuration:** Revert removal of testPathDirs ([7dea8dd](https://github.com/stryker-mutator/stryker/commit/7dea8dd))
- **Dependencies:** Pin all deps on minor version ([#974](https://github.com/stryker-mutator/stryker/issues/974)) ([f0a7e5a](https://github.com/stryker-mutator/stryker/commit/f0a7e5a)), closes [#954](https://github.com/stryker-mutator/stryker/issues/954) [#967](https://github.com/stryker-mutator/stryker/issues/967)
- **deps:** update stryker-api dep to 0.12.0 ([1831d98](https://github.com/stryker-mutator/stryker/commit/1831d98))
- **package.json:** update stryker-api version ([b3ac9bc](https://github.com/stryker-mutator/stryker/commit/b3ac9bc))
- **README:** Fix Travis Badge pointing to the wrong repo ([bfbb754](https://github.com/stryker-mutator/stryker/commit/bfbb754))
- **roots option:** Add roots option for jest v19 ([370d540](https://github.com/stryker-mutator/stryker/commit/370d540))
- **stryker init:** turn coverage analysis "off" ([#55](https://github.com/stryker-mutator/stryker/issues/55)) ([13e0697](https://github.com/stryker-mutator/stryker/commit/13e0697))
- **test:** Fix accidentally modified test ([d199206](https://github.com/stryker-mutator/stryker/commit/d199206))

### Chores

- Upgrade to stryker-api 0.5 ([5c5d412](https://github.com/stryker-mutator/stryker/commit/5c5d412))

### Features

- **basic-runner:** Implementation of a basic Jest-runner ([#4](https://github.com/stryker-mutator/stryker/issues/4)) ([44a831a](https://github.com/stryker-mutator/stryker/commit/44a831a))
- **es2015-promise:** Remove dep to es6-promise ([28453a4](https://github.com/stryker-mutator/stryker/commit/28453a4))
- **jest-config:** override jest config ([#34](https://github.com/stryker-mutator/stryker/issues/34)) ([e783c80](https://github.com/stryker-mutator/stryker/commit/e783c80))
- **Jest-runner:** support jest configuration ([#25](https://github.com/stryker-mutator/stryker/issues/25)) ([4f83e87](https://github.com/stryker-mutator/stryker/commit/4f83e87))
- **logging:** Allow log to a file ([#954](https://github.com/stryker-mutator/stryker/issues/954)) ([c2f6b82](https://github.com/stryker-mutator/stryker/commit/c2f6b82)), closes [#748](https://github.com/stryker-mutator/stryker/issues/748)
- **node version:** drop node 4 support, as Stryker did. ([#47](https://github.com/stryker-mutator/stryker/issues/47)) ([e939d25](https://github.com/stryker-mutator/stryker/commit/e939d25))
- **stryker-api:** add stryker-api 0.15 support ([#45](https://github.com/stryker-mutator/stryker/issues/45)) ([d51d7ba](https://github.com/stryker-mutator/stryker/commit/d51d7ba))
- **typescript:** Add support for create-react-app using Typescript ([#48](https://github.com/stryker-mutator/stryker/issues/48)) ([7cc9b86](https://github.com/stryker-mutator/stryker/commit/7cc9b86))

### BREAKING CHANGES

- **typescript:** Require Jest 22.x or higher. Support for 20.x and 21.x is dropped.
- **node version:** Node 4 is no longer supported.
- Upgrade to stryker-api 0.5

<a name="0.7.0"></a>

# [0.7.0](https://github.com/stryker-mutator/stryker-jest-runner/compare/v0.6.0...v0.7.0) (2018-05-11)

### Features

- **node version:** drop node 4 support, as Stryker did. ([#47](https://github.com/stryker-mutator/stryker-jest-runner/issues/47)) ([017139d](https://github.com/stryker-mutator/stryker-jest-runner/commit/017139d))
- **stryker-api:** add stryker-api 0.15 support ([#45](https://github.com/stryker-mutator/stryker-jest-runner/issues/45)) ([94b22ab](https://github.com/stryker-mutator/stryker-jest-runner/commit/94b22ab))
- **typescript:** Add support for create-react-app using Typescript ([#48](https://github.com/stryker-mutator/stryker-jest-runner/issues/48)) ([e7c313d](https://github.com/stryker-mutator/stryker-jest-runner/commit/e7c313d))

### BREAKING CHANGES

- **typescript:** Require Jest 22.x or higher. Support for 20.x and 21.x is dropped.
- **node version:** Node 4 is no longer supported.

<a name="0.6.0"></a>

# [0.6.0](https://github.com/stryker-mutator/stryker-jest-runner/compare/v0.5.1...v0.6.0) (2018-04-06)

### Features

- **jest-config:** fallback to default Jest config if it's not overridden ([#42](https://github.com/stryker-mutator/stryker-jest-runner/issues/42)) ([72b542a](https://github.com/stryker-mutator/stryker-jest-runner/commit/72b542a))

<a name="0.5.1"></a>

## [0.5.1](https://github.com/stryker-mutator/stryker-jest-runner/compare/v0.5.0...v0.5.1) (2018-03-02)

### Bug Fixes

- **bail:** disable bail ([#36](https://github.com/stryker-mutator/stryker-jest-runner/issues/36)) ([0d44ecc](https://github.com/stryker-mutator/stryker-jest-runner/commit/0d44ecc))

<a name="0.5.0"></a>

# [0.5.0](https://github.com/stryker-mutator/stryker-jest-runner/compare/v0.4.2...v0.5.0) (2018-02-23)

### Features

- **jest-config:** override jest config ([#34](https://github.com/stryker-mutator/stryker-jest-runner/issues/34)) ([095e366](https://github.com/stryker-mutator/stryker-jest-runner/commit/095e366))

<a name="0.4.2"></a>

## [0.4.2](https://github.com/stryker-mutator/stryker-jest-runner/compare/v0.4.1...v0.4.2) (2018-02-07)

### Bug Fixes

- **package.json:** update stryker-api version ([7ab05e6](https://github.com/stryker-mutator/stryker-jest-runner/commit/7ab05e6))

<a name="0.4.1"></a>

## [0.4.1](https://github.com/stryker-mutator/stryker-jest-runner/compare/v0.4.0...v0.4.1) (2018-02-07)

<a name="0.4.0"></a>

# [0.4.0](https://github.com/stryker-mutator/stryker-jest-runner/compare/v0.2.2...v0.4.0) (2018-02-06)

### Bug Fixes

- **deps:** update stryker-api dep to 0.12.0 ([3867190](https://github.com/stryker-mutator/stryker-jest-runner/commit/3867190))
- **roots option:** Add roots option for jest v19 ([ec7bd35](https://github.com/stryker-mutator/stryker-jest-runner/commit/ec7bd35))

### Features

- **Jest-runner:** support jest configuration ([#25](https://github.com/stryker-mutator/stryker-jest-runner/issues/25)) ([630b60b](https://github.com/stryker-mutator/stryker-jest-runner/commit/630b60b))

<a name="0.3.0"></a>

# 0.3.0 (2017-11-03)

- 0.3.0 ([f9563b7](https://github.com/stryker-mutator/stryker-jest-runner/commit/f9563b7))
- chore(docs) Update changelog ([c26f442](https://github.com/stryker-mutator/stryker-jest-runner/commit/c26f442))
- feat(runner) Add support for Jest v21 (#21) (#22) ([98ba822](https://github.com/stryker-mutator/stryker-jest-runner/commit/98ba822))
- refactor: Add semicolon ([c1d1c1c](https://github.com/stryker-mutator/stryker-jest-runner/commit/c1d1c1c))
- refactor(.vscode): Reset build files ([5eee921](https://github.com/stryker-mutator/stryker-jest-runner/commit/5eee921))
- refactor(test): Reset 4 tab whitespace ([eeab8e1](https://github.com/stryker-mutator/stryker-jest-runner/commit/eeab8e1))
- fix(roots option): Add roots option for jest v19 ([ec7bd35](https://github.com/stryker-mutator/stryker-jest-runner/commit/ec7bd35))

<a name="0.2.2"></a>

## 0.2.2 (2017-10-23)

- 0.2.2 ([9959ee4](https://github.com/stryker-mutator/stryker-jest-runner/commit/9959ee4))
- chore(build) Don't include files in npm package that don't belong ([b73430f](https://github.com/stryker-mutator/stryker-jest-runner/commit/b73430f))
- chore(docs) Update changelog ([403ff0d](https://github.com/stryker-mutator/stryker-jest-runner/commit/403ff0d))
- chore(dependencies): Update to stryker-api 0.10.0 ([7fefd60](https://github.com/stryker-mutator/stryker-jest-runner/commit/7fefd60))

<a name="0.2.1"></a>

## 0.2.1 (2017-09-27)

- 0.2.1 ([b8bb5e8](https://github.com/stryker-mutator/stryker-jest-runner/commit/b8bb5e8))
- chore(docs) Update changelog ([ccac703](https://github.com/stryker-mutator/stryker-jest-runner/commit/ccac703))

<a name="0.2.0"></a>

# 0.2.0 (2017-09-23)

- 0.2.0 ([897fbba](https://github.com/stryker-mutator/stryker-jest-runner/commit/897fbba))
- chore(docs) Update changelog ([790d317](https://github.com/stryker-mutator/stryker-jest-runner/commit/790d317))
- fix(test): Fix accidentally modified test ([62a1785](https://github.com/stryker-mutator/stryker-jest-runner/commit/62a1785))
- chore(dependencies): Update to stryker-api 0.9 ([09e59d2](https://github.com/stryker-mutator/stryker-jest-runner/commit/09e59d2))
- chore(package-lock): Disable lock on packages ([48b39b6](https://github.com/stryker-mutator/stryker-jest-runner/commit/48b39b6))

<a name="0.1.0"></a>

# 0.1.0 (2017-08-14)

- 0.1.0 ([f8f798c](https://github.com/stryker-mutator/stryker-jest-runner/commit/f8f798c))
- feat(runner) Add support for Jest v20 (#16) ([ad9c282](https://github.com/stryker-mutator/stryker-jest-runner/commit/ad9c282))
- chore: Upgrade to stryker-api 0.5 ([7bf2c86](https://github.com/stryker-mutator/stryker-jest-runner/commit/7bf2c86))

### BREAKING CHANGE

- Upgrade to stryker-api 0.5

<a name="0.0.6"></a>

## 0.0.6 (2017-03-02)

- chore: release v0.0.6 ([f36f665](https://github.com/stryker-mutator/stryker-jest-runner/commit/f36f665))
- chore: update contributors ([fb17fd7](https://github.com/stryker-mutator/stryker-jest-runner/commit/fb17fd7))
- fix(configuration): Allow more test file names ([f54dfc3](https://github.com/stryker-mutator/stryker-jest-runner/commit/f54dfc3))
- fix(configuration): Remove test regex filter ([14ca864](https://github.com/stryker-mutator/stryker-jest-runner/commit/14ca864))
- fix(configuration): Remove unnecessary options ([278a754](https://github.com/stryker-mutator/stryker-jest-runner/commit/278a754))
- fix(configuration): Revert removal of testPathDirs ([dd5de98](https://github.com/stryker-mutator/stryker-jest-runner/commit/dd5de98))
- Fix(lint): Add missing semicolon ([86c6170](https://github.com/stryker-mutator/stryker-jest-runner/commit/86c6170))
- chore(doc) Fix URLs in package.json ([f718a45](https://github.com/stryker-mutator/stryker-jest-runner/commit/f718a45))
- chore(doc) Re-create CHANGELOG.md ([868cc92](https://github.com/stryker-mutator/stryker-jest-runner/commit/868cc92))

<a name="0.0.5"></a>

## 0.0.5 (2017-02-13)

- chore: release v0.0.5 ([94d9010](https://github.com/stryker-mutator/stryker-jest-runner/commit/94d9010))
- fix(plugin) Use correct name for registering plugin ([1ae61fb](https://github.com/stryker-mutator/stryker-jest-runner/commit/1ae61fb))
- fix(reporting) Error messages should only be filled if there are some ([8faf6c9](https://github.com/stryker-mutator/stryker-jest-runner/commit/8faf6c9))

<a name="0.0.4"></a>

## 0.0.4 (2017-02-10)

- chore: release v0.0.4 ([ebbbb71](https://github.com/stryker-mutator/stryker-jest-runner/commit/ebbbb71))
- chore(doc) clean duplicates from changelog ([ba9c278](https://github.com/stryker-mutator/stryker-jest-runner/commit/ba9c278))
- doc(readme) Mention that coverageAnalysis does not (yet) work ([8b0d1bd](https://github.com/stryker-mutator/stryker-jest-runner/commit/8b0d1bd))

<a name="0.0.3"></a>

## 0.0.3 (2017-02-10)

- chore: add LICENSE file ([72481a5](https://github.com/stryker-mutator/stryker-jest-runner/commit/72481a5))
- chore: initial commit ([aa043d6](https://github.com/stryker-mutator/stryker-jest-runner/commit/aa043d6))
- chore: release v0.0.2 ([c27827d](https://github.com/stryker-mutator/stryker-jest-runner/commit/c27827d))
- chore: release v0.0.3 ([1dc606c](https://github.com/stryker-mutator/stryker-jest-runner/commit/1dc606c))
- chore: update contributors ([730a93b](https://github.com/stryker-mutator/stryker-jest-runner/commit/730a93b))
- chore: update contributors ([1af92d8](https://github.com/stryker-mutator/stryker-jest-runner/commit/1af92d8))
- chore: update contributors ([48bd6dc](https://github.com/stryker-mutator/stryker-jest-runner/commit/48bd6dc))
- docs(readme) Update documentation and clean-up package.json (#5) ([97d1661](https://github.com/stryker-mutator/stryker-jest-runner/commit/97d1661))
- feat(basic-runner): Implementation of a basic Jest-runner (#4) ([960c59d](https://github.com/stryker-mutator/stryker-jest-runner/commit/960c59d))
- feat(es2015-promise): Remove dep to es6-promise ([7f8424a](https://github.com/stryker-mutator/stryker-jest-runner/commit/7f8424a))
- fix(README): Fix Travis Badge pointing to the wrong repo ([9177447](https://github.com/stryker-mutator/stryker-jest-runner/commit/9177447))
